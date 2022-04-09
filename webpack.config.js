const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: { index: path.resolve(__dirname, 'src', 'index.js')},
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
    })
  ],
  optimization: {
    splitChunks: {chunks: 'all'},
  },
  devServer: {
    hot: false,
    liveReload: true,
  },
  watchOptions: {
    ignored: /node_modules/,
    poll: true,
  }
};
