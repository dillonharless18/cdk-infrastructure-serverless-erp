import VeryfiCustomClient from "./VeryfiCustomClient.cjs";
const ActualClient = require("@veryfi/veryfi-sdk/lib/main");

// Mock the parent class
jest.mock("@veryfi/veryfi-sdk");

// Require the mocked class
const TEST_DATA = [
    {
        account_number: null,
        bill_to: {
            address: "123 Test Drive\nFayetteville, NC 28306",
            name: "Chaa Loftin",
            parsed_address: null,
            vat_number: null,
        },
        cashback: null,
        category: "Office Supplies & Software",
        created_date: "2023-05-27 22:56:32",
        currency_code: "USD",
        date: "2023-05-01 18:11:14",
        delivery_date: null,
        discount: null,
        document_reference_number: "MM9K78712X",
        document_title: "Receipt",
        document_type: "receipt",
        due_date: null,
        duplicate_of: null,
        external_id: null,
        id: 138511126,
        img_file_name: "138511126.pdf",
        img_thumbnail_url:
            "https://scdn.veryfi.com/receipts/618790da-463a-409b-941f-f5f57626dfd1/thumbnail.jpg?Expires=1685749220&Signature=fv05ermJR86RpoM2ipLDDvOtjaUUnGCfeOB98Wvanmmw5m-ES5TGVSZZ4HRQxCGGEyxECacoYXcgSA6mLqy1tk2vpe92gVGzDU8QSMbq41zK98OV9pnpUDZQbw2HcofIvM~j6gS8IXI805OAOL~4Nrkg2myq8eAz7BsssQTi1t~TxzpXOhNtAGs0rgQZZ96uKVQKifw~KiZdjiVN3W42hNgCn63EUrGhEajy~Xxi6Ogq7JT5nsoutZogQKUnUCAuHtyuHT7ZpV3d3VnjaGhOt3yV71px2IIuol510GkgNSfaJbcSqgRXzjLYUcww0GM7D17t8sVkl-V6LXiG991kJg__&Key-Pair-Id=APKAJCILBXEJFZF4DCHQ",
        img_url:
            "https://scdn.veryfi.com/receipts/618790da-463a-409b-941f-f5f57626dfd1/5e273009-4368-4025-8ae3-8e1136fdf0d9.pdf?Expires=1685749220&Signature=P2cz~zEJUJc4we6KMpfTP9OY8gTnMMbxTCRbNZxEXFgq1ikFgj4onXWdERH2z1lFHg9YelI6XJjQJ63Z-AgWzhM9VwZBvmkCIhKoFLVejMFXz0UyGthjxEzZoUaPmrGZKhiJBeiNqSxFWaN1FlTrNYp7DasbLTfnqWiT-PkR-fauXed2VXLbNPoQFM1adG-TLMfvukJ9EpQ6NUjCRf9SK4wrQNJSMX3Ba~KOUhLkQVVwzYec7S3Tfaxh7~XgHR1GqkYau30mAgwKYCL5LV76fzM-rZoiUQ30QpoDgSOrvNxQHlKm9CWOFxjeR9exAKXXnNCOVCiKeNJObo~ydMGj9A__&Key-Pair-Id=APKAJCILBXEJFZF4DCHQ",
        insurance: null,
        invoice_number: "154658927423",
        is_duplicate: false,
        is_money_in: false,
        line_items: [
            {
                date: null,
                description:
                    "FAX from iPhone: Send, Receive\nFAX\nUnlimited Send And Receive (7 Days)\nRenews May 8, 2023",
                discount: null,
                discount_rate: null,
                end_date: null,
                id: 586295142,
                order: 0,
                price: null,
                quantity: 1,
                reference: null,
                section: null,
                sku: null,
                start_date: null,
                tags: [],
                tax: null,
                tax_rate: null,
                text: "FAX from iPhone: Send, Receive\nFAX Unlimited Send And Receive (7 Days) Renews May 8, 2023",
                total: 9.99,
                type: "service",
                unit_of_measure: null,
                upc: null,
            },
        ],
        meta: {
            owner: "chaamail",
            processed_pages: null,
            source: null,
            total_pages: null,
        },
        notes: null,
        ocr_text:
            '\n\fForwarded Message\nFrom: Apple <no_reply@email.apple.com>\nTo: "chaamail@yahoo.com" <chaamail@yahoo.com>\nSent: Monday, May 1, 2023, 06:11:14 PM EDT\nSubject: Your receipt from Apple.\n\tReceipt\n\nAPPLE ID\nchaamail@yahoo.com\t\t\tBILLED TO\n\tApple Card\nDATE\t\t\t\t\tChaa Loftin\nMay 1, 2023\t\t\t\t2169 Fargo drive\n\tFayetteville, NC 28306\n\tUSA\nORDER ID\tDOCUMENT NO.\nMM9K78712X\t154658927423\n\nApp Store\n\nFAX from iPhone: Send, Receive\t\t\t\t\t\t$9.99\nFAX\tUnlimited Send And Receive (7 Days)\nRenews May 8, 2023\nReport a Problem\n\n\tSubtotal\t$9.99\n\n\tTax\t$0.70\n\n\tTOTAL\t\t$10.69\n\nPrivacy: We use a Subscriber ID to provide reports to developers.\nGet help with subscriptions and purchases. Visit Apple Support. Learn how to manage your password preferences for\niTunes, Apple Books, and App Store purchases.\n\nYou have the option to stop receiving email receipts for your subscription renewals. If you have opted out, you can still\nview your receipts in your account under Purchase History. To manage receipts or to opt in again, go to Account\n\tSettings.\n\nApple ID Summary Terms of Sale\t●\tPrivacy Policy\n\nCopyright © 2023 Apple Inc.\n\tAll rights reserved\n',
        order_date: null,
        payment: {
            card_number: null,
            display_name: "Visa",
            terms: null,
            type: "visa",
        },
        pdf_url:
            "https://scdn.veryfi.com/receipts/618790da-463a-409b-941f-f5f57626dfd1/5e273009-4368-4025-8ae3-8e1136fdf0d9.pdf?Expires=1685749220&Signature=P2cz~zEJUJc4we6KMpfTP9OY8gTnMMbxTCRbNZxEXFgq1ikFgj4onXWdERH2z1lFHg9YelI6XJjQJ63Z-AgWzhM9VwZBvmkCIhKoFLVejMFXz0UyGthjxEzZoUaPmrGZKhiJBeiNqSxFWaN1FlTrNYp7DasbLTfnqWiT-PkR-fauXed2VXLbNPoQFM1adG-TLMfvukJ9EpQ6NUjCRf9SK4wrQNJSMX3Ba~KOUhLkQVVwzYec7S3Tfaxh7~XgHR1GqkYau30mAgwKYCL5LV76fzM-rZoiUQ30QpoDgSOrvNxQHlKm9CWOFxjeR9exAKXXnNCOVCiKeNJObo~ydMGj9A__&Key-Pair-Id=APKAJCILBXEJFZF4DCHQ",
        purchase_order_number: null,
        reference_number: "VBCAF-11126",
        rounding: null,
        service_end_date: null,
        service_start_date: null,
        ship_date: null,
        ship_to: {
            address: null,
            name: null,
            parsed_address: null,
        },
        shipping: null,
        store_number: null,
        subtotal: 9.99,
        tags: [],
        tax: 0.7,
        tax_lines: [],
        tip: null,
        total: 10.69,
        total_weight: null,
        tracking_number: null,
        updated_date: "2023-05-27 22:56:32",
        vendor: {
            abn_number: null,
            account_number: null,
            address: null,
            bank_name: null,
            bank_number: null,
            bank_swift: null,
            category: "Online Service",
            email: null,
            fax_number: null,
            iban: null,
            lat: null,
            lng: null,
            logo: "https://cdn.veryfi.com/logos/us/260752777.png",
            name: "Apple",
            phone_number: null,
            raw_address: null,
            raw_name: "Apple",
            reg_number: null,
            type: "Online Service",
            vat_number: null,
            web: null,
        },
    },
];

describe("VeryfiCustomClient", () => {
    let client;

    beforeEach(() => {
        // Make the _request method a mock
        ActualClient.prototype._request = jest.fn();

        // Create a new instance of the actual class, not the mocked class
        client = new VeryfiCustomClient(
            "clientId",
            "clientSecret",
            "username",
            "apiKey"
        );
    });

    describe("getDocumentsCreatedWithinRangeEmptyReponse", () => {
        it("should call the _request method with correct arguments and empty response", async () => {
            ActualClient.prototype._request.mockResolvedValue({
                data: { documents: [] },
            });

            const output = await client.getDocumentsCreatedWithinRange(2, 1);

            expect(ActualClient.prototype._request).toHaveBeenCalledWith(
                "GET",
                expect.stringContaining("/documents?"),
                expect.anything() // here you might want to validate the passed parameters
            );
            expect(output).toEqual([]);
        });

        it("should call the _request method with correct arguments and non-empty outupt", async () => {
            ActualClient.prototype._request.mockResolvedValue({
                data: { documents: TEST_DATA },
            });

            const output = await client.getDocumentsCreatedWithinRange(2, 1);

            expect(ActualClient.prototype._request).toHaveBeenCalledWith(
                "GET",
                expect.stringContaining("/documents?"),
                expect.anything() // here you might want to validate the passed parameters
            );
            expect(output).toEqual(TEST_DATA);
        });

        it("should call the _request method with correct arguments and undefined response", async () => {
            ActualClient.prototype._request.mockResolvedValue(undefined);

            const output = await client.getDocumentsCreatedWithinRange(2, 1);

            expect(ActualClient.prototype._request).toHaveBeenCalledWith(
                "GET",
                expect.stringContaining("/documents?"),
                expect.anything() // here you might want to validate the passed parameters
            );
            expect(output).toEqual([]);
        });

        it("should call the _request method with correct arguments and undefined input", async () => {
            ActualClient.prototype._request.mockResolvedValue({});

            const output = await client.getDocumentsCreatedWithinRange(
                undefined,
                undefined
            );

            expect(ActualClient.prototype._request).toHaveBeenCalledWith(
                "GET",
                expect.stringContaining("/documents?"),
                expect.anything() // here you might want to validate the passed parameters
            );
            expect(output).toEqual([]);
        });
    });
});
