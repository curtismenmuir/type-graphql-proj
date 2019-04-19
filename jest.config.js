module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./",
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["./**/*.ts"],
  coverageDirectory: "<rootDir>/coverage"
};
