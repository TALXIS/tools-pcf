# @talxis/pcf-preset-base

A unified build package containing build depndencies and defaults from Microsoft's PCF template. It is used to streamline dependencies and optimize install process. It also handles a few troublesome cases (see [here](scripts/fix-pcfscripts.js)) in PCF tooling and enables easier operation in monorepo scenarios.

## Usage

Simply add this package to your `package.json` (via `npm install` or similar), remove the default dependencies (except for `@types/*`) and you are good to go.

## Versions

This package's version doesn't follow Microsoft's versions and instead is rather opinionated by [NETWORG](https://www.networg.com).