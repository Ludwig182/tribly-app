// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');              // accepte *.cjs
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
