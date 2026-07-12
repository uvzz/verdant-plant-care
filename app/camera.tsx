import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from 'expo-camera';
import { Leaf, SwitchCamera, Zap, ZapOff } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Type } from '@/constants/Typography';
import { cancelCameraCapture, deliverCameraCapture } from '@/lib/cameraBridge';

const GROWTH = '#C6D45A';
const NIGHT = '#0F1612';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturing, setCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Animations
  const pulse = useSharedValue(0);
  const frameIn = useSharedValue(0);
  const shutterScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const tipOpacity = useSharedValue(0);
  const previewIn = useSharedValue(0);
  const leafRotate = useSharedValue(0);

  useEffect(() => {
    frameIn.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    tipOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    leafRotate.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
    return () => {
      cancelAnimation(pulse);
      cancelAnimation(leafRotate);
    };
  }, [frameIn, tipOpacity, pulse, leafRotate]);

  useEffect(() => {
    if (previewUri) {
      previewIn.value = withSpring(1, { damping: 16, stiffness: 140 });
    } else {
      previewIn.value = 0;
    }
  }, [previewUri, previewIn]);

  const close = useCallback(
    (uri: string | null) => {
      deliverCameraCapture(uri);
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)');
    },
    [router]
  );

  const onCancel = () => {
    cancelCameraCapture();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const onCapture = async () => {
    if (!cameraRef.current || capturing || previewUri) return;
    setCapturing(true);
    shutterScale.value = withSequence(
      withTiming(0.86, { duration: 80 }),
      withSpring(1, { damping: 8, stiffness: 280 })
    );
    flashOpacity.value = withSequence(
      withTiming(0.85, { duration: 60 }),
      withTiming(0, { duration: 280 })
    );
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.88,
        skipProcessing: Platform.OS === 'android',
      });
      if (photo?.uri) {
        setPreviewUri(photo.uri);
      }
    } catch {
      // keep UI calm
    } finally {
      setCapturing(false);
    }
  };

  const frameStyle = useAnimatedStyle(() => ({
    opacity: frameIn.value,
    transform: [{ scale: interpolate(frameIn.value, [0, 1], [1.06, 1]) }],
  }));

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.18]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.55, 0.15]),
  }));

  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const tipStyle = useAnimatedStyle(() => ({
    opacity: tipOpacity.value,
    transform: [{ translateY: interpolate(tipOpacity.value, [0, 1], [12, 0]) }],
  }));

  const previewStyle = useAnimatedStyle(() => ({
    opacity: previewIn.value,
    transform: [{ scale: interpolate(previewIn.value, [0, 1], [1.04, 1]) }],
  }));

  const leafStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(leafRotate.value, [0, 1], [0, 360])}deg` },
    ],
    opacity: 0.12,
  }));

  if (!permission) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={GROWTH} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.center, { padding: 28 }]}>
        <Text style={[Type.displayM, { color: '#EEF3EF', textAlign: 'center' }]}>
          Camera access
        </Text>
        <Text
          style={[
            Type.bodySmall,
            { color: 'rgba(232,239,233,0.7)', textAlign: 'center', marginTop: 10 },
          ]}
        >
          Verdant needs the camera for plant portraits and progress photos. Photos stay on
          your device.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => [
            styles.permBtn,
            { opacity: pressed ? 0.9 : 1, marginTop: 24 },
          ]}
        >
          <Text style={[Type.button, { color: '#2A3318' }]}>Allow camera</Text>
        </Pressable>
        <Pressable onPress={onCancel} style={{ marginTop: 16, padding: 12 }}>
          <Text style={[Type.meta, { color: 'rgba(232,239,233,0.55)' }]}>Not now</Text>
        </Pressable>
      </View>
    );
  }

  const frameSize = Math.min(width * 0.86, height * 0.48);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Live camera or preview */}
      {previewUri ? (
        <Animated.View style={[StyleSheet.absoluteFill, previewStyle]}>
          <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        </Animated.View>
      ) : (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
          onCameraReady={() => setReady(true)}
        />
      )}

      {/* Soft vignette */}
      <View style={styles.vignetteTop} pointerEvents="none" />
      <View style={styles.vignetteBottom} pointerEvents="none" />

      {/* Decorative orbiting leaf mark */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.leafMark,
          { top: insets.top + 72, right: 28 },
          leafStyle,
        ]}
      >
        <Leaf color="rgba(198,212,90,0.55)" size={40} strokeWidth={1.6} />
      </Animated.View>

      {/* Flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.flash, flashStyle]}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={onCancel}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close camera"
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.iconBtnText}>✕</Text>
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={[Type.micro, { color: GROWTH, letterSpacing: 1.2 }]}>VERDANT</Text>
          <Text style={[Type.meta, { color: 'rgba(238,243,239,0.9)', marginTop: 2 }]}>
            {previewUri ? 'Review portrait' : 'Glasshouse camera'}
          </Text>
        </View>
        {!previewUri ? (
          <Pressable
            onPress={() =>
              setFlash((f) => (f === 'off' ? 'on' : f === 'on' ? 'auto' : 'off'))
            }
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={`Flash ${flash}`}
            style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            {flash === 'off' ? (
              <ZapOff color="#EEF3EF" size={20} strokeWidth={2} />
            ) : (
              <Zap
                color={flash === 'on' ? '#C6D45A' : '#EEF3EF'}
                size={20}
                strokeWidth={2}
              />
            )}
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      {/* Viewfinder frame */}
      {!previewUri ? (
        <Animated.View
          style={[
            styles.frameWrap,
            { width: frameSize, height: frameSize },
            frameStyle,
          ]}
          pointerEvents="none"
        >
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <Animated.View style={[styles.scanLine, pulseRingStyle]} />
        </Animated.View>
      ) : null}

      {/* Tip */}
      {!previewUri ? (
        <Animated.View style={[styles.tip, tipStyle, { bottom: insets.bottom + 148 }]}>
          <Text style={[Type.meta, { color: 'rgba(238,243,239,0.85)', textAlign: 'center' }]}>
            Fill the frame with a leaf or whole plant · bright, even light works best
          </Text>
        </Animated.View>
      ) : null}

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        {previewUri ? (
          <>
            <Pressable
              onPress={() => setPreviewUri(null)}
              style={({ pressed }) => [
                styles.secondaryCtl,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
            >
              <Text style={[Type.button, { color: '#EEF3EF', fontSize: 15 }]}>Retake</Text>
            </Pressable>
            <Pressable
              onPress={() => close(previewUri)}
              style={({ pressed }) => [
                styles.useBtn,
                { opacity: pressed ? 0.9 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Use this photo"
            >
              <Text style={[Type.button, { color: '#2A3318' }]}>Use photo</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
              style={({ pressed }) => [
                styles.secondaryCtl,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Flip camera"
            >
              <SwitchCamera color="#EEF3EF" size={22} strokeWidth={2} />
              <Text style={[Type.meta, { color: 'rgba(238,243,239,0.75)', marginTop: 2 }]}>
                Flip
              </Text>
            </Pressable>

            <View style={styles.shutterWrap}>
              <Animated.View style={[styles.pulseRing, pulseRingStyle]} />
              <Animated.View style={shutterStyle}>
                <Pressable
                  onPress={onCapture}
                  disabled={!ready || capturing}
                  accessibilityRole="button"
                  accessibilityLabel="Take photo"
                  style={({ pressed }) => [
                    styles.shutterOuter,
                    {
                      opacity: !ready || capturing ? 0.5 : pressed ? 0.92 : 1,
                    },
                  ]}
                >
                  <View style={styles.shutterInner}>
                    {capturing ? (
                      <ActivityIndicator color={NIGHT} />
                    ) : (
                      <View style={styles.shutterDot} />
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            </View>

            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.secondaryCtl,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={{ fontSize: 20 }}>←</Text>
              <Text style={[Type.meta, { color: 'rgba(238,243,239,0.75)', marginTop: 2 }]}>
                Back
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const CORNER = 28;
const BORDER = 3;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NIGHT,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vignetteTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 160,
    backgroundColor: 'rgba(15,22,18,0.45)',
  },
  vignetteBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
    backgroundColor: 'rgba(15,22,18,0.55)',
  },
  flash: {
    backgroundColor: '#FFFFFF',
  },
  leafMark: {
    position: 'absolute',
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  titleBlock: {
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15,22,18,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconBtnText: {
    color: '#EEF3EF',
    fontSize: 18,
  },
  frameWrap: {
    position: 'absolute',
    alignSelf: 'center',
    top: '22%',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: GROWTH,
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: BORDER,
    borderLeftWidth: BORDER,
    borderTopLeftRadius: 10,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: BORDER,
    borderRightWidth: BORDER,
    borderTopRightRadius: 10,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BORDER,
    borderLeftWidth: BORDER,
    borderBottomLeftRadius: 10,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BORDER,
    borderRightWidth: BORDER,
    borderBottomRightRadius: 10,
  },
  scanLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: '48%',
    height: 1.5,
    backgroundColor: GROWTH,
    borderRadius: 2,
  },
  tip: {
    position: 'absolute',
    left: 28,
    right: 28,
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  secondaryCtl: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: GROWTH,
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: '#EEF3EF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,22,18,0.25)',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: GROWTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: NIGHT,
    opacity: 0.25,
  },
  useBtn: {
    flex: 1,
    maxWidth: 200,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: GROWTH,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  permBtn: {
    minHeight: 52,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: GROWTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
