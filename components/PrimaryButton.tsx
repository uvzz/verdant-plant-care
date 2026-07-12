import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Colors from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { tapLight } from '@/lib/haptics';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  /** Optional leading icon (pass a lucide icon element sized ~16-18). */
  icon?: React.ReactNode;
  /** Optional override for screen readers */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  icon,
  accessibilityLabel,
  accessibilityHint,
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const bg =
    variant === 'primary'
      ? c.growth
      : variant === 'secondary'
        ? c.surface
        : variant === 'danger'
          ? c.danger
          : 'transparent';
  const fg =
    variant === 'primary'
      ? c.growthInk
      : variant === 'danger'
        ? '#FFFFFF'
        : c.text;
  const border =
    variant === 'ghost' || variant === 'secondary' ? c.border : 'transparent';

  return (
    <Pressable
      onPress={() => {
        tapLight();
        onPress();
      }}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <>
          <ActivityIndicator color={fg} style={{ marginRight: 8 }} />
          <Text style={[Type.button, { color: fg, opacity: 0.85 }]} numberOfLines={1}>
            {label}
          </Text>
        </>
      ) : (
        <>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={[Type.button, { color: fg }]} numberOfLines={2}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: { marginRight: 7, marginTop: 1 },
});
