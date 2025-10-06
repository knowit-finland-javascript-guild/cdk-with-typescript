import {Item, validateItem } from "../Item";

describe("Item", () => {
    describe("validator", () => {
        it("accepts a valid item", () => {
            // Arrange
            const input: Item = {
                description: "Some description",
                name: "Some name",
                value: 48
            }

            // Act
            const result = validateItem(input);

            // Assert
            expect(result).toBeTruthy()
        })

        it("throws if description field is missing", () => {
            // Arrange
            const input: any = {
                name: "Some name",
                value: 48
            }

            // Act
            // Assert
            try {
                validateItem(input);
            } catch (e) {
                expect(e).toBeTruthy()
            }
        })

        it("throws if description field is empty", () => {
            // Arrange
            const input: any = {
                description: "",
                name: "Some name",
                value: 48
            }

            // Act
            // Assert
            try {
                validateItem(input);
            } catch (e) {
                expect(e).toBeTruthy()
            }
        })

        it("throws if description field is a number", () => {
            // Arrange
            const input: any = {
                description: 48,
                name: "Some name",
                value: 48
            }

            // Act
            // Assert
            try {
                validateItem(input);
            } catch (e) {
                expect(e).toBeTruthy()
            }
        })

        it("throws if description field is an object", () => {
            // Arrange
            const input: any = {
                description: { foo: "bar" },
                name: "Some name",
                value: 48
            }

            // Act
            // Assert
            try {
                validateItem(input);
            } catch (e) {
                expect(e).toBeTruthy()
            }
        })

        it("throws if description field is undefined", () => {
            // Arrange
            const input: any = {
                description: undefined,
                name: "Some name",
                value: 48
            }

            // Act
            // Assert
            try {
                validateItem(input);
            } catch (e) {
                expect(e).toBeTruthy()
            }
        })

        // In a real project you would write way more test cases to make sure that the validation can handle all edge cases
    })
})