module.exports = {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@bundled-es-modules)/)"
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],  // Ensure the setup file is included
};
