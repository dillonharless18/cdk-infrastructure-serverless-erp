class VeryfiUtil {
    /**
     * Returns true if the param is a nonempty string
     *
     * @param {String} stringToValidate The string that should be nonempty
     * @returns true or false
     */
    static isValidString(stringToValidate) {
        return (
            typeof stringToValidate === "string" &&
            stringToValidate.trim() !== ""
        );
    }

    /**
     * Returns true if the param is a non-zero number
     *
     * @param {Number} numberToValidate The number that should be non-zero
     * @returns true or false
     */
    static isValidNumber(numberToValidate) {
        return typeof numberToValidate === "number" && numberToValidate !== 0;
    }
}

export default VeryfiUtil;
