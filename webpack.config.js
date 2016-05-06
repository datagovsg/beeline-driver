var path = require('path');

module.exports = {
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'html',
                exclude: /node_modules/,
                include: path.resolve('.'),
                query: {
                    attrs: false,
                },
            },
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/,
                include: path.resolve('.'),
            },
        ],
    },
    entry: [
        path.resolve('beeline-driver/app.js'),
    ],
    output: {
        path: path.resolve('www/lib'),
        filename: 'bundle.js',
        pathinfo: true,
    },
    babel: {
        presets: ['es2015', 'stage-3'],
        sourceMaps: true,
        plugins: ['transform-runtime']
    },
};
