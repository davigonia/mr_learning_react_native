const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  resolve: {
    extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'react-native$': 'react-native-web',
      '@react-navigation/elements': '@react-navigation/elements/lib/module/index.js',
      '@react-navigation/native': '@react-navigation/native/lib/module/index.js',
      '@react-navigation/stack': '@react-navigation/stack/lib/module/index.js',
      'react-native-screens': 'react-native-screens/lib/module/index.js',
      'react-native-safe-area-context': 'react-native-safe-area-context/lib/module/index.js',
      'react-native-gesture-handler': 'react-native-gesture-handler/lib/module/index.js'
    },
    fallback: {
      'react-native-screens': false,
      'react-native-reanimated': false
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000
  }
};
