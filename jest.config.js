module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./",
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["./**/*.ts"],
  coverageDirectory: "<rootDir>/coverage",
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
