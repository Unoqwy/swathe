const fs = require("fs");
const { readdirSync } = fs;
const path = require("path");
const sass = require("sass");
const formatTime = require("pretty-ms");

const { camelCase } = require("camel-case");
const { snakeCase } = require("snake-case");

const packageMetaData = Object.fromEntries(
    Object.entries(require("./package.json"))
        .filter(([_, val]) => typeof val === "string")
        .map(([key, val]) => [key, JSON.stringify(val)])
);

const packPlugins = (
    process.env.PACK_PLUGINS?.split(",") ??
    readdirSync("plugins", { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(dir => dir.name)
).map(name => [name, path.join(__dirname, "plugins", name)]);

const spackEntries = {};
const renderedStylesheets = {};
let renderingTotalTime = 0;

for (const [name, dir] of packPlugins) {
    const entry = path.join(dir, "index.ts");
    if (!fs.existsSync(entry)) {
        console.error(`Plugin "${name}" not found!`);
        process.exit(1);
    }

    spackEntries[snakeCase(name)] = entry;

    const stylesheet = path.join(dir, "css", "index.scss");
    if (fs.existsSync(stylesheet)) {
        const cssRendered = sass.renderSync({
            file: stylesheet,
            outputStyle: "compressed",
            sourceMap: false,
        });
        renderedStylesheets[`${camelCase(name)}Stylesheet`] = JSON.stringify(cssRendered.css.toString());
        renderingTotalTime += cssRendered.stats.duration;
    }
}

const renderedStylesheetCount = Object.keys(renderedStylesheets).length;
if (renderedStylesheetCount > 0) {
    console.log(
        `CSS render time (${renderedStylesheetCount}): ${formatTime(renderingTotalTime, { secondsDecimalDigits: 2 })}`
    );
}

module.exports = require("@swc/core/spack").config({
    entry: spackEntries,
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
                        "@stylesheets": renderedStylesheets,
                    },
                },
            },
            target: "es2016",
        },
        minify: true,
        sourceMaps: false,
    },
});
