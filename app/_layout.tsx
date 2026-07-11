import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { PlantProvider } from '@/lib/PlantContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

const LightNav = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.growth,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.growth,
  },
};

const DarkNav = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.growth,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.growth,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <PlantProvider>
      <RootLayoutNav />
    </PlantProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkNav : LightNav}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.text,
          headerTitleStyle: {
            fontFamily: 'Outfit_600SemiBold',
            fontSize: 17,
          },
          contentStyle: { backgroundColor: c.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="plant/add"
          options={{
            title: 'Add plant',
            presentation: 'modal',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: c.background },
          }}
        />
        <Stack.Screen
          name="plant/edit"
          options={{
            title: 'Edit plant',
            presentation: 'modal',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: c.background },
          }}
        />
        <Stack.Screen
          name="plant/[id]"
          options={{
            title: 'Plant',
            headerShadowVisible: false,
            headerTransparent: true,
            headerTintColor: '#FFFFFF',
            headerTitle: '',
          }}
        />
        <Stack.Screen
          name="plant/log"
          options={{
            title: 'Log care',
            presentation: 'modal',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: c.background },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
