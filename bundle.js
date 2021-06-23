#!/usr/bin/env node

const fs = require("fs");
const { readdirSync } = fs;
const path = require("path");
const { promisify } = require("util");

const browserify = require("browserify");
const prettyMillis = require("pretty-ms");
const sass = require("sass");
const tsify = require("tsify");
const uglify = require("uglify-js");

function formatTime(millis) {
    return prettyMillis(millis, { secondsDecimalDigits: 2 });
}

const packPlugins = (
    process.env.PACK_PLUGINS?.split(",") ??
    readdirSync("plugins", { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(dir => dir.name)
).map(name => [name, path.join(__dirname, "plugins", name)]);

const renderedStylesheets = {};
let renderingTotalTime = 0;

for (const [name, dir] of packPlugins) {
    const entry = path.join(dir, "index.ts");
    if (!fs.existsSync(entry)) {
        console.error(`Plugin "${name}" not found!`);
        process.exit(1);
    }

    const stylesheet = path.join(dir, "css", "index.scss");
    if (fs.existsSync(stylesheet)) {
        const cssRendered = sass.renderSync({
            file: stylesheet,
            outputStyle: "compressed",
            sourceMap: false,
        });
        renderedStylesheets[name] = JSON.stringify(cssRendered.css.toString());
        renderingTotalTime += cssRendered.stats.duration;
    }
}

const renderedStylesheetCount = Object.keys(renderedStylesheets).length;
if (renderedStylesheetCount > 0) {
    console.log(`CSS render time (${renderedStylesheetCount}): ${formatTime(renderingTotalTime)}`);
}

fs.mkdirSync("dist", { recursive: true });

async function bundlePlugin([pluginName, pluginPath]) {
    const name = pluginName.replaceAll("-", "_");
    const startAt = performance.now();

    const bundler = browserify(path.join(pluginPath, "index.ts"), {
        node: true,
    })
        .plugin(tsify)
        .external("@stylesheets")
        .external("fsevents");
    const bundle = promisify(bundler.bundle.bind(bundler));

    let output;
    try {
        output = (await bundle()).toString();
    } catch (err) {
        console.warn(`Unable to bundle plugin '${name}'!`);
        console.error(err.toString());
        return;
    }

    // wrap bundled plugin in a function to prevent redefinition errors
    output = `(function(){
        const pluginStylesheet = ${renderedStylesheets[pluginName] ?? "undefined"};
        ${output}
    })();`;
    output = uglify.minify(output).code;

    fs.writeFileSync(`dist/${name}.js`, output, "utf-8");
    console.log(`Bundled plugin '${name}': ${formatTime(performance.now() - startAt)}`);
}

(async () => {
    await Promise.all(
        packPlugins.map(async plugin => {
            bundlePlugin(plugin);
        })
    );
})();
