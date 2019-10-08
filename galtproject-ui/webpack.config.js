"use strict";

const coreConfig = require('@galtproject/frontend-core/webpack.config');

const UIThread = Object.assign({}, coreConfig({
    path: __dirname,
    domainLock: ['.galtproject.io', '127.0.0.1', 'galt-app.surge.sh'],
    copy: [
        {from: "./node_modules/leaflet/dist/images", to: "./build/images"},
        {from: "./src/images", to: "./build/images"},
        {from: "./node_modules/@galtproject/space-renderer/public/model-assets/", to: "./model-assets/"},
    ]
}), {
    name: "GaltProject UI",
    //https://github.com/vuematerial/vue-material/issues/1182#issuecomment-345764031
    entry: {
        'babel-polyfill': 'babel-polyfill',
        'app.js': './src/main.ts',
        'changelog.temp': './CHANGELOG.MD'
    },
    output: {
        filename: './build/[name]'
    }
});

module.exports = [UIThread];
