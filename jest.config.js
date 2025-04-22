module.exports = {
  preset: 'react-native',
  setupFiles: ['./jestSetup.js'], 
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation)/)',
  ],
};