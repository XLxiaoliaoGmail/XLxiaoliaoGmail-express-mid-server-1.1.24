const path = require('path');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

module.exports = {
  mode: 'development',
  entry: './public/js/client.ts', 
  output: {
    filename: 'bundle.js',   
    path: path.resolve(__dirname, 'public/dist'), 
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,    
    hot: true,     
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      path: require.resolve('path-browserify')
    }
  },
  plugins: [
    new WebpackShellPluginNext({
      onBuildStart: {
        scripts: ['cls'],  // 使用命令清空控制台
        blocking: true,
        parallel: false
      },
      onBuildEnd: {
        scripts: [],
        blocking: false,
        parallel: true
      }
    })
  ],
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,          
        use: 'ts-loader',       
        exclude: [
          /node_modules/,
          /src/
        ],
      },
    ],
  },
};
