module.exports = {
  preset: '@testing-library/react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-screens|react-native-reanimated)/)',
  ],
  setupFilesAfterEnv: ['@testing-library/react-native/cleanup-after-each'],
  transform: {
    '^.+\\.(t)sx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      babelConfig: require('./babel.config.js'),
    },
  },
};
