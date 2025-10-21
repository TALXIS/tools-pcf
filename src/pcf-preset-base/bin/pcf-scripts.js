#!/usr/bin/env node
/**
 * Proxy script for pcf-scripts
 * This allows PCF projects to use pcf-scripts from the shared package
 */

const { spawn } = require('node:child_process');

const pcfStartPath = require.resolve('pcf-start/bin/pcf-start');
const script = require.resolve('pcf-scripts/bin/pcf-scripts');

const args = process.argv.slice(2);
if (args.includes('start')) args.push('--pcfStartPath', pcfStartPath);

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
}

run();