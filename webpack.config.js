const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
let dist = path.resolve(__dirname, 'dist');

module.exports = {
  entry: {
     app: './src/index.js',
  },
  devtool: 'inline-source-map',
  devServer: {
    static: dist,
    hot: false,
    liveReload: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
  ],
  output: {
    path: dist,
    filename: 'index.js',
    clean: true,
  },
  // mode: 'production',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {

        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',

      },
      
    ],
  },
  // remove output license
  optimization: {
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
  },

};