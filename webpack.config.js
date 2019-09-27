const webpack = require('webpack');
const path = require('path');
const RemoveSourceMapUrlWebpackPlugin = require('./remove-source-map-url-webpack-plugin.js');
const LicenseInfoWebpackPlugin = require('license-info-webpack-plugin').default;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');

module.exports = (env, argv) => {
  const PROD = argv.mode === 'production';
  const printedCommentRegExp = /webpackChunkName/;
  return {
    mode: PROD ? 'production' : 'development',
    entry: {
      app: './src/javascripts/entry.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist/assets'),
      publicPath: '/assets/',
      filename: '[name].js',
      sourceMapFilename: '[name].js.map',
      globalObject: 'this'
    },
    devServer: {
      contentBase: './dist',
      hot: true
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [
            { loader: 'eslint-loader' }
          ]
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [{
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              shouldPrintComment: PROD ? (value) => (value.match(printedCommentRegExp)) : () => (true),
              plugins: PROD ? ['transform-react-remove-prop-types'] : null,
              compact: true
            }
          }]
        },
        {
          enforce: 'pre',
          test: /\.(sass|scss|css)$/,
          use: [
            { loader: 'import-glob-loader' }
          ]
        },
        {
          test: /\.(sass|scss|css)$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: (loader) => [
                  require('iconfont-webpack-plugin')({
                    resolve: loader.resolve
                  }),
                  require('autoprefixer')({ grid: true })
                ]
              }
            },
            {
              loader: 'sass-loader',
              options: {
                outputStyle: PROD ? 'compressed' : 'expanded',
                sourceMap: false,
                url: false
              }
            }
          ]
        },
        {
          test: /\.(gif|png|jpg|eot|wof|woff|woff2|ttf|svg)$/,
          loader: 'url-loader',
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.sass', '.scss', '.css']
    },
    optimization: PROD ? {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            output: {
              comments: /author:|url:/
            }
          }
        })
      ]
    } : {},
    plugins: PROD ? [
      new webpack.NormalModuleReplacementPlugin(
        /^hammerjs$/,
        'hammerjs/hammer.min.js'
      ),
      new RemoveSourceMapUrlWebpackPlugin({}),
      new LicenseInfoWebpackPlugin({
        glob: '{LICENSE,license,License}*',
        includeLicenseFile: false
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      }),
      new webpack.optimize.OccurrenceOrderPlugin(), // コンパイルするファイルの順番を調整
      new webpack.ProgressPlugin((percentage, msg) => {
        process.stdout.write('progress ' + Math.floor(percentage * 100) + '% ' + msg + '\r');
      }),
      new StatsPlugin('../../stats.json', {
        chunkModules: true,
      }, null)
    ] : [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"development"'
      }),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new StatsPlugin('stats.json', {
        chunkModules: true,
      }, null)
    ]
  };
};
