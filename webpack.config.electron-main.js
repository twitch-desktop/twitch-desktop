var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'main': './src/main.ts',
  },

  output: {
    path: __dirname + '/app/',
    filename: '[name].js',
  },

  resolve: {
    root: path.resolve('src/node_modules'),
    extensions: ['','.ts','.js','.json', '.css', '.html']
  },

  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts',
        exclude: [ /node_modules/ ]
      },
      {
        test: /\.scss$/,
        loaders: ["raw-loader", "sass"],
      },
      {
        test: /\.html$/,
        loader: 'raw-loader'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
        loader : 'file-loader?name=[name].[ext]'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },

  plugins: [
    new CopyWebpackPlugin([
      {from: 'src/package.json' },
      {from: 'src/index.html' }
    ])
  ],
  
  target:'electron-main',
  
  node: {
    __dirname: false,
    __filename: false
  },

};
