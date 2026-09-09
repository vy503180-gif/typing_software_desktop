// babel.config.js - Babel transformer config
// React Native (Expo) JS/JSX को चलाने के लिए preset बताता है।
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};