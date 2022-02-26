module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'babel-plugin-rewrite-require',
      {
        aliases: {
          stream: 'readable-stream',
        },
      },
    ],
  ],
};
