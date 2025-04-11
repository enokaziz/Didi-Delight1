const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajout pour résoudre les problèmes de modules ES
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'expo-asset': require.resolve('expo-asset')
};

module.exports = config;