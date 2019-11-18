const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const opn = require('opn')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const port = 7123

module.exports = {
  mode: 'development',
  entry: {
    index: [
      `webpack-dev-server/client?http://localhost:${port}`,
      'webpack/hot/dev-server',
      path.resolve(__dirname, 'index.js')
    ]
  },
  output: {
    path: path.resolve(__dirname),
    filename: '[name].bundle.js'
  },
  devServer: {
    port,
    after: (app, server) => {
      opn(`http://localhost:${port}/`, { app: 'google chrome' })
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      GOOGLE_MAPS_API_KEY: JSON.stringify(process.env.GOOGLE_MAPS_API_KEY)
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      templateParameters: {},
      meta: {},
      template: './index.ejs'
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/react', '@babel/env']
            }
          }
        ],
        include: [
          fs.realpathSync(path.resolve(__dirname)),
          fs.realpathSync(path.resolve(__dirname, '..', '..', 'src'))
        ]
      }
    ]
  }
}
