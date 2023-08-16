module.exports = {
    testEnvironment: "node",
    roots: ["<rootDir>/test", "<rootDir>/lib/veryfi-integration/lambda"],
    testMatch: ["**/*.test.ts", "**/*.test.js"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.js$": "babel-jest",
        "^.+\\.cjs$": "babel-jest",
    },
};
