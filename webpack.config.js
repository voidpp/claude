var LiveReloadPlugin = require('webpack-livereload-plugin');
const path = require('path');

module.exports = {
    entry: './frontend/index.tsx',
    devtool: 'inline-source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'claude/static'),
    },
    watchOptions: {
        ignored: /node_modules/,
    },
    plugins: [
        new LiveReloadPlugin({})
    ]
};
