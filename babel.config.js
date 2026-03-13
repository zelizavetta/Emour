module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "expo-router/babel",
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./src",
            "@app": "./src/app",
            "@components": "./src/components",
            "@features": "./src/features",
            "@config": "./src/config",
            "@constants": "./src/constants",
            "@hooks": "./src/hooks",
            "@services": "./src/services",
            "@utils": "./src/utils",
            "@assets": "./assets"
          },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
        }
      ]
    ]
  };
};