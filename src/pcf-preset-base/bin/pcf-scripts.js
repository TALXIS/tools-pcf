#!/usr/bin/env node
/**
 * Proxy script for pcf-scripts
 * This allows PCF projects to use pcf-scripts from the shared package
 */

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

const pcfStartPath = require.resolve('pcf-start/bin/pcf-start');
const script = require.resolve('pcf-scripts/bin/pcf-scripts');

const args = process.argv.slice(2);
if (args.includes('start')) args.push('--pcfStartPath', pcfStartPath);

async function addSourceMapReferences() {
    try {
        const pcfConfigPath = path.join(process.cwd(), 'pcfconfig.json');
        if (!fs.existsSync(pcfConfigPath)) {
            console.log('No pcfconfig.json found, skipping source map references');
            return;
        }

        const pcfConfig = JSON.parse(fs.readFileSync(pcfConfigPath, 'utf8'));
        const outDir = path.join(process.cwd(), pcfConfig.outDir);

        if (!fs.existsSync(outDir)) {
            console.log(`Output directory ${outDir} does not exist, skipping source map references`);
            return;
        }

        const controlFolders = fs.readdirSync(outDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(outDir, dirent.name));

        for (const controlFolder of controlFolders) {
            const manifestPath = path.join(controlFolder, 'ControlManifest.xml');
            const sourceMapPath = path.join(controlFolder, 'bundle.js.map');

            if (!fs.existsSync(manifestPath)) continue;
            if (!fs.existsSync(sourceMapPath)) continue;

            try {
                const manifestContent = fs.readFileSync(manifestPath, 'utf8');

                const parser = new DOMParser({
                    errorHandler: {
                        warning: null,
                        error: (msg) => { throw new Error(msg); },
                        fatalError: (msg) => { throw new Error(msg); }
                    }
                });

                const xmlDoc = parser.parseFromString(manifestContent, 'text/xml');

                const resourcesElements = xmlDoc.getElementsByTagName('resources');
                if (resourcesElements.length === 0) {
                    console.log(`No resources section in ${path.basename(controlFolder)}/ControlManifest.xml`);
                    continue;
                }

                const resources = resourcesElements[0];

                const htmlElements = resources.getElementsByTagName('html');
                if (Array.from(htmlElements).find(html => html.getAttribute('path') === 'bundle.js.map')) {
                    console.log(`Source map reference already exists in ${path.basename(controlFolder)}`);
                    continue;
                }

                const htmlElement = xmlDoc.createElement('html');
                htmlElement.setAttribute('path', 'bundle.js.map');

                resources.appendChild(htmlElement);

                const serializer = new XMLSerializer();
                const updatedXml = serializer.serializeToString(xmlDoc);

                fs.writeFileSync(manifestPath, updatedXml, 'utf8');
                console.log(`Added source map reference to ${path.basename(controlFolder)}/ControlManifest.xml`);
            } catch (error) {
                throw new Error(`Error processing ${path.basename(controlFolder)}/ControlManifest.xml:`, error.message);
            }
        }
    } catch (error) {
        throw new Error('Error adding source map references:', error);
    }
}

async function run() {
    let outputBuffer = '';
    const errorPattern = /\[pcf-.+\] \[Error\] .*/;
    
    const code = await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [script, ...args], {
            stdio: ['inherit', 'pipe', 'pipe'],
        });
        
        child.stdout.on('data', (data) => {
            const text = data.toString();
            process.stdout.write(data);
            outputBuffer += text;
        });
        
        child.stderr.on('data', (data) => {
            const text = data.toString();
            process.stderr.write(data);
            outputBuffer += text;
        });
        
        child.on('error', reject);
        child.on('close', resolve);
    });

    if (errorPattern.test(outputBuffer)) {
        throw new Error('pcf-scripts reported errors in output');
    }

    if (code !== 0) {
        throw new Error(`pcf-scripts exited with code ${code}`);
    }

    await addSourceMapReferences();
}

run();