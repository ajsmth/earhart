module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          earhart: '../src/index',
          'test-utils': '../test-utils',
        },
      },
    ],
  ],
};
