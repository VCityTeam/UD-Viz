const fs = require('fs');
const path = require('path');

const commonConfig = require('./webpack-common.config.js');

const debugBuild = process.env.NODE_ENV === 'development';

var babelrc = fs.readFileSync(path.resolve(__dirname, '.babelrc'));
var babelConf = JSON.parse(babelrc);
var newPresets = [];
for (var preset of babelConf.presets) {
    if (!Array.isArray(preset)) {
        preset = [preset];
    }
    newPresets.push(preset);
}

babelConf.presets = newPresets;
babelConf.babelrc = false; // disable babelrc reading, as we've just done it
const replacementPluginConf = babelConf.plugins.find(plugin => Array.isArray(plugin) && plugin[0] === 'minify-replace');
replacementPluginConf[1].replacements.find(decl => decl.identifierName === '__DEBUG__').replacement.value = debugBuild;

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
    optimization: {
        runtimeChunk: { name: 'udvcore' },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src'),
                ],
                loader: 'babel-loader',
                // Please make babel modifications in the .babelrc file
                // .babelrc is used for transpiling src/ into lib/ in the prepublish
                // phase, see package.json
                options: babelConf,
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
};
