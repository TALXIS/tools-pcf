# @talxis/pcf-preset-base

A unified build package containing build depndencies and defaults from Microsoft's PCF template. It is used to streamline dependencies and optimize install process. It also handles a few troublesome cases (see [here](scripts/fix-pcfscripts.js)) in PCF tooling and enables easier operation in monorepo scenarios.

## Usage

Simply add this package to your `package.json` (via `npm install` or similar), remove the default dependencies (except for `@types/*`) and you are good to go.

### esbuild (Experimental)

Since 1.47.1, [pcf-scripts](https://www.npmjs.com/package/pcf-scripts) support building controls with [esbuild](https://esbuild.github.io/) which greatly speeds up the build performance. However as of current (1.48.1) version, the end to end support (primarily control registration with the host or testing harness) is not part of pcf-scripts. This package already includes the `esbuild` dependency and also a helper script which does this for you, which you use in your `index.ts`:

```typescript
export class Control {
    // ...
}

var registerControl = require("@talxis/pcf-preset-base/helpers/registerControl");
registerControl("Your.Full.Namespace.Control", Control);
```

Additionally, create a file called `featureconfig.json` and make sure to put the following in:

```json
{
    "pcfUseESBuild": "on"
}
```

You can read more about this [here](https://hajekj.net/2025/10/05/speeding-up-pcf-build-with-esbuild/).

## Versions

This package's version doesn't follow Microsoft's versions and instead is rather opinionated by [NETWORG](https://www.networg.com).