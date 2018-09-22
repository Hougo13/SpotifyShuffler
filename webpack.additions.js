module.exports = {
    // Temporary fix for https://github.com/mozilla/source-map/issues/304
    devtool: false,
    externals: [
        "express",
        "spotify-web-api-node",
        "electron-store",
        "body-parser",
        "rxjs-es",
    ],
};
