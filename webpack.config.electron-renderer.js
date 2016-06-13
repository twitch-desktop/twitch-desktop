var path = require('path');
var webpack = require('webpack');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {

  entry: {
    'vendor': './src/app/vendor.ts',
    'polyfills': './src/app/polyfills.ts',
    'app': './src/app/app.ts',
  },

  output: {
    path: __dirname + '/app/',
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    root: path.resolve('src/node_modules'),
    extensions: ['','.ts','.js']
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
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },

  plugins: [
    new CommonsChunkPlugin({ name: ['vendor', 'polyfills']}),
    new webpack.IgnorePlugin(/vertx/),
    
    new CopyWebpackPlugin([

      {from: 'src/node_modules/clappr/dist/clappr.min.js', to: 'vendor'},
      {from: 'src/node_modules/level-selector/dist/level-selector.min.js', to: 'vendor'},

      {from: 'src/node_modules/ng2-material/font/MaterialIcons-Regular.ttf', to: 'fonts'},
      {from: 'src/node_modules/ng2-material/font/MaterialIcons-Regular.woff', to: 'fonts'},
      {from: 'src/node_modules/ng2-material/font/MaterialIcons-Regular.woff2', to: 'fonts'},
      {from: 'src/app/assets/font/mgopenmodernabold.ttf', to: 'fonts'},
      {from: 'src/app/assets/img/404.jpg', to: 'img'}
    ])
  ],
  target:'electron-renderer'
};
