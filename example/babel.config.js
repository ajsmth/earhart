module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          'my-library': '../src/index',
        },
      },
    ],
  ],
};
