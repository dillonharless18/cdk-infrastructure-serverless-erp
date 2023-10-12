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
     * @param {*} upperLimitTimeDelta The upper limit of the range query
     * @param {*} lowerLimitTimeDelta The lower limit of the range query
     * @returns {List} List of previously created documents
     */
    async getDocumentsCreatedWithinRange(
        upperLimitTimeDelta,
        lowerLimitTimeDelta
    ) {
        try {
            const { created__gte, created__lte } =
                this.#getFormattedUTCDateTimeWithDelta();
            const endpoint_and_params = `/documents?created__gte=${created__gte}&created__lte=${created__lte}`;
            const request_arguments = {};

            console.log(
                `getDocumentsCreatedWithinRange: query string: ${endpoint_and_params}`
            );
            const veryfiResponse = await this._request(
                "GET",
                endpoint_and_params,
                request_arguments
            );

            const veryfiResponseDocuments =
                veryfiResponse?.data?.documents ?? [];
            console.log("veryfi response documents:", veryfiResponseDocuments);

            return veryfiResponseDocuments;
        } catch (error) {
            console.error(
                "Error encountered while getting documents from Veryfi client",
                error
            );
            throw error;
        }
    }

    /**
     * Generates a datetime object in UTC that occurs timeDeltaHours before the current time
     *
     * @returns {string} YYYY-MM-DD HH:00:00
     */
    #getFormattedUTCDateTimeWithDelta() {
        const now = new Date();
        const minuteInterval = parseInt(
            process.env["TIME_INTERVAL_IN_MINUTES"],
            10
        );
        const intervalInMilliseconds = minuteInterval * 60 * 1000;

        let endOfInterval = new Date(
            Math.floor(now.getTime() / intervalInMilliseconds) *
                intervalInMilliseconds
        );

        let startOfInterval = new Date(endOfInterval - intervalInMilliseconds);

        // Format intervalTime for Veryfi
        endOfInterval = endOfInterval
            .toISOString()
            .replace("T", " ")
            .slice(0, 19);

        startOfInterval = startOfInterval
            .toISOString()
            .replace("T", " ")
            .slice(0, 19);

        console.log("start time", startOfInterval, "end time:", endOfInterval);

        return {
            created__gte: startOfInterval,
            created__lte: endOfInterval,
        };
    }
}

module.exports = VeryfiCustomClient;
