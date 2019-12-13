var path = require('path');

module.exports = {
    jsonLoader: {
        // please consider modifying corresponding loaders in webpack-babel.config.js too
        test: /\.json$/,
        include: [
            path.resolve(__dirname, 'src'),
        ],
        loader: 'raw-loader',
    },
};
