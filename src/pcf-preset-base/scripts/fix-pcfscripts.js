// This code is used to fix an issue in pcf-scripts package which causes longer build times due to processing .js and .jsx files through Babel.
// Since the code is outside of our control, we need to modify the package manually after installation until Microsoft fixes the issue.
// https://hajekj.net/2025/03/01/speeding-up-pcf-build/

const fs = require('fs');
const path = require('path');

function findPcfScriptsPackages(nodeModulesPath) {
    const packages = [];
    packages.push(require.resolve("pcf-scripts/webpackConfig.js", { paths: [nodeModulesPath] }).replace(`${path.sep}webpackConfig.js`, ''));
    console.log(`Resolved pcf-scripts package: ${packages[0]}`);
    // const dirs = fs.readdirSync(nodeModulesPath, { withFileTypes: true });

    // for (const dir of dirs) {
    //     if (dir.name.startsWith('pcf-scripts')) {
    //         // Push both for compatibility with RushJS 
    //         packages.push(path.join(nodeModulesPath, dir.name));
    //         packages.push(path.join(nodeModulesPath, dir.name, "node_modules", "pcf-scripts"));
    //     }
    // }

    console.log(`Found pcf-scripts packages: ${packages.join(', ')}`);

    return packages;
}

function modifyWebpackConfig(packagePath) {
    const webpackConfigPath = path.join(packagePath, 'webpackConfig.js');
    if (fs.existsSync(webpackConfigPath)) {
        let content = fs.readFileSync(webpackConfigPath, 'utf8');
        
        const jsMatchRegex = /\/\/ Tell webpack how to handle JS, JSX, MJS, or MJSX files/;
        const jsMatch = content.match(jsMatchRegex);
        const prefix = `// Modified by @talxis/pcf-preset-base`;
        if (jsMatch) {
            const index = jsMatch.index;
            const startIndex = content.lastIndexOf('{', index);
            const endIndex = content.indexOf('},', index) + 1;
            let jsLoaderCode = content.substring(startIndex, endIndex);

            if (jsLoaderCode.includes(prefix)) {
                console.log(`webpackConfig.js code already modified: ${jsLoaderCode}, ${webpackConfigPath}`);
            }
            else if (jsLoaderCode.includes('exclude')) {
                console.error(`webpackConfig.js code already has exclude: ${jsLoaderCode}, ${webpackConfigPath}`);
            }
            else {
                let replacement = `    ${prefix}\n                    exclude: /node_modules/,\n                `;
                jsLoaderCode = jsLoaderCode.replace(/}$/, `${replacement}}`);
                console.log(`${jsLoaderCode}`);
                
                content = content.substring(0, startIndex) + jsLoaderCode + content.substring(endIndex);
            }
        }
        
        const cssMatchRegex = /{[\s]*test: \/\\\.css\$\/,[\s\S]*?},/;
        const cssMatch = content.match(cssMatchRegex);
        console.log(`cssMatch: ${cssMatch}`);
        if (cssMatch) {
            let cssLoaderCode = cssMatch[0];
            if(cssLoaderCode.includes(prefix)) {
                console.log(`webpackConfig.js CSS code already modified: ${cssLoaderCode}, ${webpackConfigPath}`);
                return;
            }
            if(cssLoaderCode.includes('require.resolve')) {
                console.error(`webpackConfig.js CSS code already has require.resolve: ${cssLoaderCode}, ${webpackConfigPath}`);
                return;
            }
            let replacement = `${prefix}\n                    use: [\n                        require.resolve("style-loader"),\n                        require.resolve("css-loader"),\n                        require.resolve("sass-loader"),\n                    ],`;
            cssLoaderCode = cssLoaderCode.replace(/use: \[.*?\],/s, replacement);
            content = content.replace(cssMatch[0], cssLoaderCode);
        }

        const svgMatchRegex = /{[\s]*test: \/\\\.svg\$\/,[\s\S]*?},/;
        const svgMatch = content.match(svgMatchRegex);
        console.log(`svgMatch: ${svgMatch}`);
        if (svgMatch) {
            let svgLoaderCode = svgMatch[0];
            if(svgLoaderCode.includes(prefix)) {
                console.log(`webpackConfig.js SVG code already modified: ${svgLoaderCode}, ${webpackConfigPath}`);
                return;
            }
            if(svgLoaderCode.includes('require.resolve')) {
                console.error(`webpackConfig.js SVG code already has require.resolve: ${svgLoaderCode}, ${webpackConfigPath}`);
                return;
            }
            let replacement = `${prefix}\n                    use: [\n                        require.resolve("@svgr/webpack")\n                    ],`;
            svgLoaderCode = svgLoaderCode.replace(/use: \[.*?\],/s, replacement);
            content = content.replace(svgMatch[0], svgLoaderCode);
        }

        fs.writeFileSync(webpackConfigPath, content, 'utf8');
        console.log(`Modified: ${webpackConfigPath}`);
    } else {
        console.warn(`webpackConfig.js not found in ${webpackConfigPath}`);
    }
}

function main() {
    const nodeModulesPath = path.resolve(__dirname, '../node_modules/');
    if (!fs.existsSync(nodeModulesPath)) {
        console.error('node_modules directory not found.');
        return;
    }

    console.log(`Scanning for pcf-scripts packages in ${nodeModulesPath}`);

    const pcfScriptsPackages = findPcfScriptsPackages(nodeModulesPath);
    for (const packagePath of pcfScriptsPackages) {
        modifyWebpackConfig(packagePath);
    }
}

main();

