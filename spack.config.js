const path = require("path");

const packageMetaData = Object.fromEntries(
    Object.entries(require("./package.json"))
        .filter(([_, val]) => typeof val === "string")
        .map(([key, val]) => [key, JSON.stringify(val)])
);

module.exports = require("@swc/core/spack").config({
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
            transform: {
                constModules: {
                    globals: {
                        "@package-info": packageMetaData,
                    },
                },
            },
            target: "es2016",
        },
        minify: true,
        sourceMaps: "inline",
    },
});
