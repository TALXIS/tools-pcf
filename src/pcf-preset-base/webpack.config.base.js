export const getBuildMode = () => {
    const cliArgs = process.argv;
    const indexOfMode = cliArgs.findIndex(x => x.includes("--buildMode"));
    return cliArgs[indexOfMode + 1].replaceAll("\"", "");
};

export const extendWebpackConfig = (customConfig) => {
    customConfig.devtool = getBuildMode() === "production" ? false : "inline-source-map";
};