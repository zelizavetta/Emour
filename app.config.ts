const APP_ENV = process.env.APP_ENV ?? "development";

const isProd = APP_ENV === "production";

module.exports = {
  expo: {
    name: isProd ? "My Expo App" : "My Expo App Dev",
    slug: "my-expo-app",
    scheme: "myexpoapp",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash-icon.png",
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
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: isProd
        ? "com.example.myexpoapp"
        : "com.example.myexpoapp.dev"
    },
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png"
    },
    extra: {
      appEnv: APP_ENV,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      aiApiUrl: process.env.EXPO_PUBLIC_AI_API_URL
    }
  }
};