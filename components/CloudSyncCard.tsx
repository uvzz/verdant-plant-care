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
import { useI18n } from '@/lib/i18n';
import { translateLabel } from '@/lib/i18n/core';
import {
  exchangeIdentityToken,
  getAuthSession,
  googleAuthConfig,
  signInWithApple,
  signOut,
  type AuthSession,
} from '@/lib/auth';
import { adoptSyncId, deleteCloudData, getOrCreateSyncId, SYNC_BUSY_REASON } from '@/lib/sync';
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
  const { t } = useI18n();
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
        // result.reason is a dynamic/provider error string (Constraint 9) —
        // only the title is ours to translate.
        Alert.alert(t('settings.syncGoogleFailedTitle'), result.reason);
      }
    })();
  }, [googleResponse, setSyncEnabled, refresh, t]);

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
      Alert.alert(t('settings.syncAppleSignedInTitle'), t('settings.syncAppleSignedInBody'));
    } else if (!result.cancelled) {
      // result.reason is a dynamic/provider error string (Constraint 9) —
      // only the title is ours to translate.
      Alert.alert(t('settings.syncAppleFailedTitle'), result.reason);
    }
  };

  // Apple 5.1.1(v): sign-in requires an in-app way to delete the account's data.
  const onDeleteCloud = () => {
    Alert.alert(
      t('settings.syncDeleteTitle'),
      t('settings.syncDeleteBody'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.syncDeleteConfirm'),
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
            // r.reason (failure body) is a dynamic error string (Constraint
            // 9) — only the title and the success body are ours to translate.
            Alert.alert(
              r.ok ? t('settings.syncDeletedTitle') : t('settings.syncDeleteFailedTitle'),
              r.ok ? t('settings.syncDeletedBody') : r.reason
            );
          },
        },
      ]
    );
  };

  const onSignOut = () => {
    Alert.alert(
      t('settings.syncSignOutTitle'),
      t('settings.syncSignOutBody'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.syncSignOutButton'),
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
        <Text style={[Type.title, { color: c.text }]}>{t('settings.syncTitle')}</Text>
      </View>

      {!isPremium ? (
        <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6 }]}>
          {t('settings.syncPremiumBlurb')}
        </Text>
      ) : session ? (
        <>
          {/* "Apple"/"Google" are brand names — kept verbatim in every
              language (same treatment as "Planta" elsewhere in this catalog),
              interpolated as {provider} rather than translated. Email/no-email
              are two whole-sentence keys (Constraint 3), not a glued
              "{a}{b ? ` · ${b}` : ''}" fragment. */}
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6 }]}>
            {session.email
              ? t('settings.syncSignedInBlurbWithEmail', {
                  provider: session.provider === 'apple' ? 'Apple' : 'Google',
                  email: session.email,
                })
              : t('settings.syncSignedInBlurb', {
                  provider: session.provider === 'apple' ? 'Apple' : 'Google',
                })}
          </Text>
          <Text style={[Type.meta, { color: syncStatus === 'error' ? c.danger : c.textMuted, marginTop: 8 }]}>
            {translateLabel(
              t,
              syncStatusLabel({
                status: syncStatus,
                lastSyncError,
                lastSyncAt: settings.lastSyncAt ?? null,
              })
            )}
          </Text>
          <PrimaryButton
            label={syncing ? t('settings.syncStatusSyncing') : t('settings.syncNowButton')}
            variant="secondary"
            loading={syncing}
            onPress={async () => {
              const r = await syncNow();
              // A collision with an already-running sync is benign — don't
              // flag it as a failure to the user.
              if (!r.ok && r.reason !== SYNC_BUSY_REASON) {
                // r.reason is a dynamic error string (Constraint 9) — only
                // the title is ours to translate.
                Alert.alert(t('settings.syncFailedTitle'), r.reason);
              }
            }}
            style={{ marginTop: 10 }}
          />
          <PrimaryButton
            label={t('settings.syncSignOutButton')}
            variant="ghost"
            onPress={onSignOut}
            style={{ marginTop: 6 }}
          />
        </>
      ) : (
        <>
          <Text style={[Type.bodySmall, { color: c.textMuted, marginTop: 6 }]}>
            {t('settings.syncSignInBlurb')}
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
              {t('settings.syncAppleUnavailable')}
            </Text>
          ) : null}
          {gConfig.configured ? (
            <PrimaryButton
              label={t('settings.syncGoogleButton')}
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
          label={deleting ? t('settings.syncDeletingButton') : t('settings.syncDeleteButton')}
          variant="ghost"
          loading={deleting}
          onPress={onDeleteCloud}
          accessibilityHint={t('settings.syncDeleteHint')}
          style={{ marginTop: 6 }}
        />
      ) : null}

      {isPremium ? (
        <>
          <PrimaryButton
            label={advanced ? t('settings.syncAdvancedHide') : t('settings.syncAdvancedShow')}
            variant="ghost"
            onPress={() => setAdvanced((v) => !v)}
            style={{ marginTop: 10, minHeight: 38 }}
          />
          {advanced ? (
            <>
              <PrimaryButton
                label={syncCode ? t('settings.syncCodeHide') : t('settings.syncCodeShow')}
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
                    {t('settings.syncCodeWarning')}
                  </Text>
                </>
              ) : null}
              <View style={styles.linkRow}>
                <TextInput
                  value={linkCode}
                  onChangeText={setLinkCode}
                  placeholder={t('settings.syncCodePlaceholder')}
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
                  label={t('settings.syncLinkButton')}
                  onPress={async () => {
                    const r = await adoptSyncId(linkCode);
                    if (!r.ok) {
                      // r.reason is a dynamic error string (Constraint 9) —
                      // only the title is ours to translate.
                      Alert.alert(t('settings.syncInvalidCodeTitle'), r.reason);
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
                      s.ok || s.reason === SYNC_BUSY_REASON;
                    Alert.alert(
                      linked ? t('settings.syncLinkedTitle') : t('settings.syncLinkedFailedTitle'),
                      linked
                        ? s.ok
                          ? s.pulledPlants === 1
                            ? t('settings.syncLinkedBodyOne')
                            : t('settings.syncLinkedBodyMany', { count: s.pulledPlants })
                          : t('settings.syncLinkedSyncing')
                        : s.reason // dynamic error string (Constraint 9)
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
