const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');
const cleanWebpackPlugin = require("clean-webpack-plugin");
let packageName = "tg-editable-grid";

module.exports = {
    entry: {
        // 多入口文件
        "tg-editable-grid": './src/main.js',
    },
    // optimization: {
    //     splitChunks: {
    //         cacheGroups: {
    //             commons: {
    //                 chunks: 'initial',
    //                 name: 'commons',
    //                 minChunks: 2,
    //                 maxInitialRequests: 5,
    //                 minSize: 0
    //             },
    //             vendor:{ // 抽离第三插件
    //                 test:/node_modules/,
    //                 chunks:'initial',
    //                 name:'vendor',
    //                 priority:10
    //             }
    //         }
    //     }
    // },
    output: {
        path:path.resolve(__dirname, 'dist'),
        // 打包多出口文件
        // 生成 a.bundle.js  b.bundle.js  jquery.bundle.js
        filename: './[name].min.js',
        library: packageName,
        libraryTarget: 'umd',
        umdNamedDefine: true,
        sourceMapFilename:"[file].map"
    },
    module:{
        rules:[
            { 
                test: /\.vue$/, 
                loader: 'vue-loader',
                options: { 
                    loaders: [ 
                        MiniCssExtractPlugin.loader, 
                        "css-loader"
                    ]
                }
            },
            { 
                test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                use: [{ loader: 'url-loader',options: { limit: 8192 } }] 
            },
            {
                test: /\.css$/,
                use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: ['babel-loader']
            }
        ]
    },
    plugins:[
        new cleanWebpackPlugin(["dist"]),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].min.css',
            // chunkFilename: 'app.[contenthash:12].css'  // use contenthash *
            chunkFilename: '[name].min.css'
        })
    ],
    resolve: {  //导入的时候不用写拓展名
        extensions: [' ', '.js', '.json', '.vue', '.scss', '.css'],
    },
    externals: [],
    mode: 'development',
    devtool: 'source-map'
};
