export interface Item {
    itemId?: string;
    name: string;
    description: string;
    value: number;
}

const itemError = "Not a valid item"

/**
 * Validates the item and returns the item of correct type if everything is valid
 * Note that in normal development you would use a package like
 * https://www.npmjs.com/package/ajv
 * or
 * https://www.npmjs.com/package/yup
 * to handle the validation and simply write a schema
 * @param inputItem
 */
export const validateItem = (inputItem: unknown): Item => {
    // Validate that input data is object
    if (typeof inputItem !== "object" || inputItem === null) throw new Error(itemError);

    // Cast the item to be of correct type
    const item = inputItem as Item;

    // Destructure properties for easier access to them
    const { name, description, value } = item;

    // Check that all fields are valid and throw an error if anything does not satisfy our rules
    // !item.name fails if the field is missing and !item.name.length fails if it's an empty string
    if (!name || !name.length ||
        !description || !description.length ||
        !value || value <= 0) throw new Error(itemError);

    // The item is valid so we can safely return it
    return item;
}