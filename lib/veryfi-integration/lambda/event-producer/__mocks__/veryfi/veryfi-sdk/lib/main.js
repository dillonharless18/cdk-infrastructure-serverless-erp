class ActualClientMock {
    constructor() {
        this.clientId = "123";
        this.clientSecret = "secret";
        this.username = "username";
        this.apiKey = "123abc";
    }

    // Mock the _request method as just a jest function since
    // we're providing manual implementations in the test itself.
    _request() {
        return jest.fn();
    }
}

// Export the mock class
export default ActualClientMock;
