module.exports = {
  preset: 'react-native',
  setupFiles: ['./jestSetup.js'], 
  transformIgnorePatterns: [
    'node_modules/(?!(react-native-vector-icons|react-native|@react-native|react-native-maps)/)',
  ],
};