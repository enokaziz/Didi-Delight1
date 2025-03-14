module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        ['module:react-native-dotenv',
          {'moduleName': '@env',
            'path': '.env',
            'safe': true,
            'allowUndefined': false,

          }
        ],
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@utils": "./src/utils",
            "@assets": "./src/assets",
            "@constants": "./src/constants",

            
            // Ajoute ici d'autres alias si nécessaire
          },
        },
      ],
    ],
  };
};
