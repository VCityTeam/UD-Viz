var path = require('path');
var webpack = require('webpack');

var commonConfig = require('./webpack-common.config.js');

var definePlugin = new webpack.DefinePlugin({
    __DEBUG__: JSON.stringify(process.env.NODE_ENV === 'development'),
});

module.exports = {
    entry: {
        udvcore: ['es6-promise', path.resolve(__dirname, 'src/Main.js')]
    },
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: '[name]',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    plugins: [
        definePlugin,
        new webpack.optimize.CommonsChunkPlugin({ name: 'udvcore' }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src'),
                ],
                loader: 'babel-loader',
                // Please consider modifying .babelrc too
                // .babelrc is used for transpiling src/ into lib/ in the prepublish
                // phase, see package.json
                options: {
                    presets: ['env'],
                    plugins: ['transform-runtime'],
                    babelrc: false,
                },
            },
            {
                // We also want to (web)pack the style files:
                test:/\.css$/,
                use:['style-loader','css-loader']
            },
            {
                // (web)pack "small" images
                test: /\.(png|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 100000, // Convert images < 100kb to base64 strings
                        name: 'images/[hash]-[name].[ext]'
                    }
                }]
            },
            commonConfig.jsonLoader,
        ],
    },
    devServer: {
        publicPath: '/dist/',
    },
    resolve: {
    alias: {
       handlebars: 'handlebars/dist/handlebars.min.js'
    }
}
};
