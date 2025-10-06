import { personsWithAge, PersonWithAge } from "./Person";

export const executeReduceExample = () => {
    console.log("");
    console.log("Starting reduce example");
    console.log("");

    // Annoying part of TS is adding types to generic objects
    // This would have to be repeated for every different object
    type PersonObjectType = {
        [key: string]: PersonWithAge;
    };

    let personsObject: PersonObjectType = {};

    // With generics, you can declare it once but it's usage is a bit more complicated
    type PersonObjectWithGenericsType<T> = {
        [key: string]: T;
    };

    let personObjectWithGenerics: PersonObjectWithGenericsType<PersonWithAge> =
        {};

    // Records can also be used to describe simple object structures
    type PersonRecord = Record<string, PersonWithAge>;

    let personsWithForLoop: PersonRecord = {};

    for (let i = 0; i < personsWithAge.length; i++) {
        const person = personsWithAge[i];
        if (person.age < 18) {
            const fullName = `${person.firstName} ${person.lastName}`;
            personsWithForLoop[fullName] = person;
        }
    }

    console.log("personsWithForLoop", personsWithForLoop);

    // Reduce function is the closest to a regular for-loop
    // You do not know what it's doing until you look inside
    // Always prefer filter and map when possible
    const personsWithReduce = personsWithAge.reduce((acc, curr) => {
        if (curr.age < 18) {
            const fullName = `${curr.firstName} ${curr.lastName}`;
            acc[fullName] = curr;
        }
        return acc;
    }, {} as PersonRecord);

    console.log("personsWithReduce", personsWithReduce);
};
