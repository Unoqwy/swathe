#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const uglify = require("uglify-js");

const distDir = path.join(__dirname, "..", "dist");

// wrap bundled plugin in a function to prevent redefinition errors
fs.readdirSync(distDir)
    .filter(name => name.endsWith(".js"))
    .forEach(fileName => {
        const pluginFile = path.join(distDir, fileName);
        let pluginSources = fs.readFileSync(pluginFile, "utf-8");
        pluginSources = `(function(){${pluginSources}})();`;
        pluginSources = uglify.minify(pluginSources).code;
        fs.writeFileSync(pluginFile, pluginSources, "utf-8");
    });
