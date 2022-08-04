const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        scenario: './src/scenario.ts',
        solverApplet: './src/solverApplet.ts'
    },
    output: {
        filename: '[name].bundle.js',
        library: 'model',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        modules: [
            'src',
            'node_modules'
        ],
        extensions: [
            '.js',
            '.ts'
        ]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    devtool: 'inline-source-map',
    target: 'web'
};
