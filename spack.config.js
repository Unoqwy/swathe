const path = require("path");
const sass = require("sass");
const formatTime = require("pretty-ms");

const packageMetaData = Object.fromEntries(
    Object.entries(require("./package.json"))
        .filter(([_, val]) => typeof val === "string")
        .map(([key, val]) => [key, JSON.stringify(val)])
);

const sassResult = sass.renderSync({
    file: "./css/index.scss",
    outputStyle: "compressed",
    sourceMap: false,
});
console.log(`CSS done: ${formatTime(sassResult.stats.duration, { secondsDecimalDigits: 2 })}`);

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
                        "@bundle": {
                            cssSource: JSON.stringify(sassResult.css.toString()),
                        },
                        "bb-types": {
                            /* eslint-disable-next-line @typescript-eslint/naming-convention */
                            Plugin: "Plugin",
                        },
                    },
                },
            },
            target: "es2016",
        },
        minify: true,
        sourceMaps: false,
    },
});
