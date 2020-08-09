module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testRegex: '^(.*\\.)(test|spec)\\.(ts|js)$',
  coverageDirectory: 'coverage',
  coverageReporters: ['text'],
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  modulePathIgnorePatterns: ['<rootDir>/build/'],
};