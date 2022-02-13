
const packageJson = require('./package.json');

module.exports = {
    dependencies: packageJson.dependencies.mapValues(() => ({
        platforms: {}
    })),
};