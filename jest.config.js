module.exports = {
  preset: 'react-native',
  setupFiles: ['./jestSetup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native' +
      '|@react-native' +
      '|react-native-maps' +
      '|react-native-vector-icons' +
      '|@react-navigation' +
      '|react-clone-referenced-element' +
      '|@react-native-async-storage' +
      '|@react-native-community' +
      '|@react-native-picker' +
      '|@react-native-masked-view' +
      '|@react-native-segmented-control' +
      '|@react-native-firebase' +
      '|react-native-screens' +
      '|react-native-safe-area-context' +
      '|react-native-gesture-handler' +
      '|react-native-reanimated' +
      '|react-native-vector-icons' +
    ')/)'
  ],
};