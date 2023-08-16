module.exports = {
    testEnvironment: "node",
    moduleDirectories: ["node_modules"],
    roots: ["<rootDir>/test", "<rootDir>/lib/veryfi-integration/lambda"],
    testMatch: ["**/*.test.ts", "**/*.test.js"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.js$": "babel-jest",
        "^.+\\.cjs$": "babel-jest",
    },
};
