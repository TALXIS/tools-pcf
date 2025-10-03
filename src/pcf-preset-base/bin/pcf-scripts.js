#!/usr/bin/env node
/**
 * Proxy script for pcf-scripts
 * This allows PCF projects to use pcf-scripts from the shared package
 */

var pcfStartPath = require.resolve("pcf-start/bin/pcf-start");

// Forward all arguments to pcf-scripts
if (process.argv.includes('start')) {
    process.argv.push('--pcfStartPath', pcfStartPath);
}

require("pcf-scripts/bin/pcf-scripts");
