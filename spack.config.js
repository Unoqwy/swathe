const path = require("path");
const { config } = require("@swc/core/spack");

module.exports = config({
    entry: {
        mouseless: path.join(__dirname, "src", "index.ts"),
    },
    output: {
        path: path.join(__dirname, "dist"),
    },
    options: {
        jsc: {
            parser: {
                syntax: "typescript",
            },
            target: "es5",
        },
        minify: true,
        sourceMaps: "inline",
    },
});
