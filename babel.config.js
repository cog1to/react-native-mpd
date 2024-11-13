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
		[
			'@babel/plugin-transform-private-methods', { loose: true }
		],
		[
			'react-native-reanimated/plugin',
		]
  ],
};
