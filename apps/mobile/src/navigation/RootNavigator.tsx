import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabs from './MainTabs';
import LoginScreen from '@/screens/LoginScreen';

import { RootStackParamList } from '@/types/navigation';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { UserProvider } from '@/providers/UserContext';
import { MedsProvider } from '@/providers/MedsProvider';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';

const RootStack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  return (
    <MedsProvider>
      <UserProvider>
        <RootStack.Navigator
          screenOptions={{
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: fonts?.base },
          }}
        >
          <RootStack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        </RootStack.Navigator>
      </UserProvider>
    </MedsProvider>
  );
}

function RootNavigatorInner() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return token ? <AppNavigator /> : <LoginScreen />;
}

export default function RootNavigator() {
  return (
    <AuthProvider>
      <RootNavigatorInner />
    </AuthProvider>
  );
}
