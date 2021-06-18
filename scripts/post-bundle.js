#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");

// wrap bundled plugin in a function to prevent redefinition errors
fs.readdirSync(distDir)
    .filter(name => name.endsWith(".js"))
    .forEach(fileName => {
        const pluginFile = path.join(distDir, fileName);
        let pluginSources = fs.readFileSync(pluginFile, "utf-8");
        if (pluginSources.startsWith("(function(){") && pluginSources.endsWith("})();")) {
            return;
        }
        pluginSources = `(function(){${pluginSources}})();`;
        fs.writeFileSync(pluginFile, pluginSources, "utf-8");
    });
