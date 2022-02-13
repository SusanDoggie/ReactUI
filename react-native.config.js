
const packageJson = require('./package.json');

module.exports = {
    dependency: packageJson.dependencies.mapValues(() => ({
        platforms: {}
    })),
};