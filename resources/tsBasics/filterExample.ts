import { personsWithAge } from "./Person";

export const executeFilterExample = () => {
    console.log("");
    console.log("Starting filter example");
    console.log("");

    const personWithForLoop = [];

    // Again, no idea what's happening until you look inside the for loop
    // The loop structure provides no value to the person reading the code
    for (let i = 0; i < personsWithAge.length; i++) {
        const person = personsWithAge[i];
        if (person.age < 18) {
            personWithForLoop.push(person);
        }
    }

    console.log("personWithForLoop", personWithForLoop);

    // Filter function is 0..n relation with the data.
    // You immediately know what to expect to happen from the function used
    const personWithFilter = personsWithAge.filter((person) => person.age < 18);

    console.log("personWithFilter", personWithFilter);

    let fullNameWithForLoops: string[] = [];

    for (let i = 0; i < personsWithAge.length; i++) {
        const person = personsWithAge[i];
        // Property destructuring is a powerful tool
        const { age, firstName, lastName } = person;

        if (age < 18) {
            const fullName = `${firstName} ${lastName}`;
            fullNameWithForLoops.push(fullName);
        }
    }

    console.log("fullNameWithForLoops", fullNameWithForLoops);

    // You can chain multiple functions for concise, yet clear description of what's happening
    const fullNameWithFilter = personsWithAge
        .filter((person) => person.age < 18)
        .map((person) => `${person.firstName} ${person.lastName}`);

    console.log("fullNameWithFilter", fullNameWithFilter);
};
