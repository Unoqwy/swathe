const path = require("path");
const { config } = require("@swc/core/spack");

module.exports = config({
    entry: {
        mouseless: path.join(__dirname, "src", "index.js"),
    },
    output: {
        path: path.join(__dirname, "dist"),
    },
    options: {
        jsc: {
            parser: {
                syntax: "ecmascript",
            },
            target: "es5",
        },
        minify: true,
        sourceMaps: "inline",
    },
});
