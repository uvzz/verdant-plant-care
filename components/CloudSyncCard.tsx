import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { CloudUpload } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { usePlants } from '@/lib/PlantContext';
import {
  exchangeIdentityToken,
  getAuthSession,
  googleAuthConfig,
  signInWithApple,
  signOut,
  type AuthSession,
} from '@/lib/auth';
import { adoptSyncId, deleteCloudData, getOrCreateSyncId } from '@/lib/sync';
import { syncStatusLabel } from '@/lib/syncSchedule';

WebBrowser.maybeCompleteAuthSession();

/**
 * Cloud sync card: sign in once, then sync is automatic (after edits, on
 * foreground, at launch). Sync-code linking stays as an advanced fallback
 * for cross-ecosystem setups.
 */
export function CloudSyncCard() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { settings, syncNow, setSyncEnabled, refresh, syncing, syncStatus, lastSyncError } = usePlants();
  const isPremium = settings.isPremium;

  const [session, setSession] = useState<AuthSession | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [linkCode, setLinkCode] = useState('');
  const [deleting, setDeleting] = useState(false);

  const gConfig = googleAuthConfig();
  const [, googleResponse, promptGoogle] = Google.useIdTokenAuthRequest({
    // At least one must be non-empty for the hook; the button is hidden
    // unless gConfig.configured, so the placeholder is never actually used.
    clientId: gConfig.webClientId ?? 'unconfigured.apps.googleusercontent.com',
    iosClientId: gConfig.iosClientId,
    androidClientId: gConfig.androidClientId,
  });

  useEffect(() => {
    getAuthSession().then(setSession);
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => {});
    }
  }, []);

  // Google returns via browser redirect — finish the exchange when it lands.
  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const idToken = googleResponse.params?.id_token;
    if (!idToken) return;
    (async () => {
      setBusy(true);
      const result = await exchangeIdentityToken('google', idToken);
      setBusy(false);
      if (result.ok) {
        setSession(result.session);
        // Load the (now wiped-or-new) storage into memory before enabling sync
        // so no later mutation writes the prior account's data back.
        await refresh();
        await setSyncEnabled(true);
      } else {
        Alert.alert('Google sign-in failed', result.reason);
      }
    })();
  }, [googleResponse, setSyncEnabled, refresh]);

  const onApple = async () => {
    setBusy(true);
    const result = await signInWithApple();
    setBusy(false);
    if (result.ok) {
      setSession(result.session);
      // Load the (now wiped-or-new) storage into memory before enabling sync
      // so no later mutation writes the prior account's data back.
      await refresh();
      await setSyncEnabled(true);
      Alert.alert('Signed in', 'Your plants now back up and sync automatically.');
    } else if (!result.cancelled) {
      Alert.alert('Apple sign-in failed', result.reason);
    }
  };

  // Apple 5.1.1(v): sign-in requires an in-app way to delete the account's data.
  const onDeleteCloud = () => {
    Alert.alert(
      'Delete synced data?',
      'This permanently removes your plants, care history, and photos from the cloud, and signs you out. Your plants stay on this device — delete the app to remove them too. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const r = await deleteCloudData();
            if (r.ok) {
              await signOut();
              await setSyncEnabled(false);
              setSession(null);
              setSyncCode(null);
            }
            setDeleting(false);
            Alert.alert(
              r.ok ? 'Synced data deleted' : 'Delete failed',
              r.ok
                ? 'Your cloud collection is gone and sync is off. Your plants are still on this device.'
                : r.reason
            );
          },
        },
      ]
    );
  };

  const onSignOut = () => {
    Alert.alert(
      'Sign out?',
      'Sync pauses on this device. Your plants stay here and in your cloud backup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            await setSyncEnabled(false);
            setSession(null);
            setSyncCode(null);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.titleRow}>
        <CloudUpload color={c.tint} size={18} strokeWidth={2.2} />
        <Text style={[Type.title, { color: c.text }]}>Backup & sync</Text>
      </View>

      {!isPremium ? (
        <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6 }]}>
          Premium: sign in once and your plants, care history, and photos back
          up automatically and follow you to any device.
        </Text>
      ) : session ? (
        <>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6 }]}>
            Signed in with {session.provider === 'apple' ? 'Apple' : 'Google'}
            {session.email ? ` · ${session.email}` : ''}. Everything syncs
            automatically — after changes, on app open, and when you return.
          </Text>
          <Text style={[Type.meta, { color: syncStatus === 'error' ? c.danger : c.textMuted, marginTop: 8 }]}>
            {syncStatusLabel({
              status: syncStatus,
              lastSyncError,
              lastSyncAt: settings.lastSyncAt ?? null,
            })}
          </Text>
          <PrimaryButton
            label={syncing ? 'Syncing…' : 'Sync now'}
            variant="secondary"
            loading={syncing}
            onPress={async () => {
              const r = await syncNow();
              // A collision with an already-running sync is benign — don't
              // flag it as a failure to the user.
              if (!r.ok && r.reason !== 'A sync is already in progress.') {
                Alert.alert('Sync failed', r.reason);
              }
            }}
            style={{ marginTop: 10 }}
          />
          <PrimaryButton
            label="Sign out"
            variant="ghost"
            onPress={onSignOut}
            style={{ marginTop: 6 }}
          />
        </>
      ) : (
        <>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6 }]}>
            Sign in once — your plants, care history, and photos back up and
            sync automatically across devices.
          </Text>
          {appleAvailable ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={
                scheme === 'dark'
                  ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                  : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={14}
              style={styles.appleBtn}
              onPress={busy ? () => {} : onApple}
            />
          ) : Platform.OS === 'ios' ? (
            <Text style={[Type.meta, { color: c.textMuted, marginTop: 10 }]}>
              Sign into an Apple Account in system Settings to enable Sign in
              with Apple.
            </Text>
          ) : null}
          {gConfig.configured ? (
            <PrimaryButton
              label="Continue with Google"
              variant="secondary"
              loading={busy}
              onPress={() => promptGoogle()}
              style={{ marginTop: 8 }}
            />
          ) : null}
        </>
      )}

      {/* Deletion must be reachable whenever a cloud collection exists — not
          only when signed in. A sync-code linked device has cloud data with no
          session, and Apple 5.1.1(v) still requires an in-app way to delete it. */}
      {isPremium && (session || settings.syncEnabled) ? (
        <PrimaryButton
          label={deleting ? 'Deleting…' : 'Delete synced data'}
          variant="ghost"
          loading={deleting}
          onPress={onDeleteCloud}
          accessibilityHint="Permanently removes your collection from the cloud"
          style={{ marginTop: 6 }}
        />
      ) : null}

      {isPremium ? (
        <>
          <PrimaryButton
            label={advanced ? 'Hide advanced linking' : 'Advanced: link with sync code'}
            variant="ghost"
            onPress={() => setAdvanced((v) => !v)}
            style={{ marginTop: 10, minHeight: 38 }}
          />
          {advanced ? (
            <>
              <PrimaryButton
                label={syncCode ? 'Hide this device’s code' : 'Show this device’s code'}
                variant="ghost"
                onPress={async () =>
                  setSyncCode(syncCode ? null : await getOrCreateSyncId())
                }
                style={{ minHeight: 38 }}
              />
              {syncCode ? (
                <>
                  <Text
                    selectable
                    style={[
                      Type.meta,
                      {
                        color: c.text,
                        marginTop: 6,
                        fontFamily: Fonts.bodySemi,
                        letterSpacing: 0.5,
                      },
                    ]}
                  >
                    {syncCode}
                  </Text>
                  <Text style={[Type.meta, { color: c.textMuted, marginTop: 4 }]}>
                    Treat it like a password.
                  </Text>
                </>
              ) : null}
              <View style={styles.linkRow}>
                <TextInput
                  value={linkCode}
                  onChangeText={setLinkCode}
                  placeholder="Paste a sync code…"
                  placeholderTextColor={c.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[
                    styles.input,
                    {
                      color: c.text,
                      backgroundColor: c.background,
                      borderColor: c.border,
                      fontFamily: Fonts.body,
                    },
                  ]}
                />
                <PrimaryButton
                  label="Link"
                  onPress={async () => {
                    const r = await adoptSyncId(linkCode);
                    if (!r.ok) {
                      Alert.alert('Invalid code', r.reason);
                      return;
                    }
                    setLinkCode('');
                    // Load the (now wiped-or-new) storage into memory before
                    // enabling sync so no later mutation writes the prior
                    // account's data back.
                    await refresh();
                    await setSyncEnabled(true);
                    const s = await syncNow();
                    // setSyncEnabled(true) already kicks off a sync, so this
                    // explicit call may hit the in-flight guard — that's not a
                    // failure, the enable-triggered sync is running.
                    const linked =
                      s.ok || s.reason === 'A sync is already in progress.';
                    Alert.alert(
                      linked ? 'Device linked' : 'Linked, but sync failed',
                      linked
                        ? s.ok
                          ? `Now sharing a collection (${s.pulledPlants} plants).`
                          : 'Syncing your collection now…'
                        : s.reason
                    );
                  }}
                  style={{ minWidth: 72 }}
                />
              </View>
            </>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appleBtn: { height: 48, marginTop: 12 },
  linkRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 42,
  },
});
