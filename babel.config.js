module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        jsxRuntime: 'automatic'
      }]
    ],
    plugins: [
      'module:expo-asset', // Changé ici
      [
        "module:react-native-dotenv",
        {
          moduleName: '@env',
          path: '.env',
          safe: true,
          allowUndefined: false,
        }
      ],
      [
        "module-resolver",
        {
          root: ['./src'],
          alias: {
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@utils": "./src/utils",
            "@assets": "./assets",
            "@constants": "./src/constants",
            "@assetsSrc": "./src/assets",
            "@assetsRoot": "./assets"
          }
        }
      ],
      "react-native-reanimated/plugin"
    ]
  };
};