const Client = require("@veryfi/veryfi-sdk");

/**
 * Extends the Veryfi Client class
 *
 * @param {string} clientId Your Veryfi client id
 * @param {string} clientSecret Your Veryfi client secret
 * @param {string} username Your Veryfi username
 * @param {string} apiKey Your Veryfi API key
 **/
class VeryfiCustomClient extends Client {
    constructor(clientId, clientSecret, username, apiKey) {
        super(clientId, clientSecret, username, apiKey);
    }

    /**
     * Get JSON of previously created documents between a given time period
     *
     * @param {*} created__gte The upper limit of the range query
     * @param {*} created__lte The lower limit of the range query
     * @returns {List} List of previously created documents
     */
    async getDocumentsCreatedWithinRange(
        upperLimitTimeDelta,
        lowerLimitTimeDelta
    ) {
        const created__gte =
            this.#getFormattedUTCDateTimeWithDelta(upperLimitTimeDelta);
        const created__lte =
            this.#getFormattedUTCDateTimeWithDelta(lowerLimitTimeDelta);
        const endpoint_and_params = `/documents?created__gte=${created__gte}&created__lte=${created__lte}`;
        const request_arguments = {};
        const veryfiResponse = await this._request(
            "GET",
            endpoint_and_params,
            request_arguments
        );
        const veryfiResponseDocuments = veryfiResponse?.data?.documents ?? [];

        return veryfiResponseDocuments;
    }

    /**
     * Generates a datetime object in UTC that occurs timeDeltaHours before the current time
     *
     * @param {*} timeDeltaHours The difference in hours between now and the target time
     * @returns {string} YYYY-MM-DD HH:00:00
     */
    #getFormattedUTCDateTimeWithDelta(timeDeltaHours = 0) {
        const targetTime = new Date(
            Date.now() - timeDeltaHours * 60 * 60 * 1000
        );
        const targetTimeString =
            targetTime.toISOString().replace("T", " ").slice(0, 14) + "00:00";
        console.log("formatted datetime: " + targetTimeString);
        return targetTimeString;
    }
}

module.exports = VeryfiCustomClient;
