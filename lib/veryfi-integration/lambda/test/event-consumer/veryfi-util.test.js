import VeryfiUtil from "../../event-consumer/veryfi-util.js";

describe("VeryfiUtil", () => {
    describe("isValidString", () => {
        it("should return true for a nonempty string", () => {
            expect(VeryfiUtil.isValidString("hello")).toBe(true);
        });

        it("should return false for an empty string", () => {
            expect(VeryfiUtil.isValidString("")).toBe(false);
        });

        it("should return false for a non-string value", () => {
            expect(VeryfiUtil.isValidString(123)).toBe(false);
        });
    });

    describe("isValidNumber", () => {
        it("should return true for a non-zero number", () => {
            expect(VeryfiUtil.isValidNumber(42)).toBe(true);
        });

        it("should return false for zero", () => {
            expect(VeryfiUtil.isValidNumber(0)).toBe(false);
        });

        it("should return false for a non-number value", () => {
            expect(VeryfiUtil.isValidNumber("123")).toBe(false);
        });
    });

    describe("formatStringWithMaxLength", () => {
        it("should return the same string if it is within the max length", () => {
            const input = "Hello, world!";
            expect(VeryfiUtil.formatStringWithMaxLength(input, 20)).toBe(input);
        });

        it("should trim and add ellipsis if the string is longer than the max length", () => {
            const input = "This is a long string that needs to be truncated.";
            expect(VeryfiUtil.formatStringWithMaxLength(input, 20)).toBe(
                "This is a long st..."
            );
        });

        it("should return an empty string for invalid input", () => {
            expect(VeryfiUtil.formatStringWithMaxLength(null)).toBe("");
        });
    });
});
