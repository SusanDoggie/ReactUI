
const packageJson = require('./package.json');

module.exports = {
    project: {
      ios: {},
      android: {},
    },
    dependency: {
      platforms: {
        ios: {},
        android: {},
      },
    },
    dependencies: packageJson.dependencies.mapValues(() => ({
        platforms: {
            ios: {},
            android: {},
        }
    })),
};