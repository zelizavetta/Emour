import type { ExpoConfig } from "expo/config";

const APP_ENV = process.env.APP_ENV ?? "development";
const isProd = APP_ENV === "production";

const config: ExpoConfig = {
  name: isProd ? "Emour" : "Emour Dev",
  slug: "my-expo-app",
  plugins: [
    "expo-secure-store",
    "@react-native-community/datetimepicker",
    [
      "expo-notifications",
      {
        icon: "./src/assets/logo.jpg",
        color: "#FA57B7",
        defaultChannel: "meds",
        androidMode: "default",
      },
    ],
  ],
  scheme: "myexpoapp",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  icon: "./src/assets/logo.jpg",
  splash: {
    image: "./src/assets/logo.jpg",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: isProd
      ? "com.example.myexpoapp"
      : "com.example.myexpoapp.dev"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/logo.jpg",
      backgroundColor: "#ffffff"
    },
    edgeToEdgeEnabled: true,
    package: isProd
      ? "com.example.myexpoapp"
      : "com.example.myexpoapp.dev"
  },
  web: {
    bundler: "metro",
    favicon: "./src/assets/logo.jpg"
  },
  extra: {
    appEnv: APP_ENV,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    aiApiUrl: process.env.EXPO_PUBLIC_AI_API_URL
  }
};

export default config;