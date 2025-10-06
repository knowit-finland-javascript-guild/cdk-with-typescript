import { persons } from "./Person";

export const executeMapExample = () => {
    console.log("");
    console.log("Starting map example");
    console.log("");

    // Initialize separately
    // let variables can change at any time
    let dataWithForLoops: string[] = [];

    // Look inside the loop structure to see what is happening
    for (let i = 0; i < persons.length; i++) {
        const fullName = `${persons[i].firstName} ${persons[i].lastName}`;
        dataWithForLoops.push(fullName);
    }

    // Map is n..n relation with the original data.
    // You know the new array length just by looking at the function call
    const dataWithMap = persons.map(
        (person) => `${person.firstName} ${person.lastName}`
    );

    // A whoopsie and the let variable changes the whole value.
    // But luckily Typescript prevents it.
    // This would have been a valid operation with Javascript
    // dataWithForLoops = "Glad I'm not Javascript";

    // Even Javascript prevents const from changing value
    // dataWithMap = "Preventable whoopsie"

    console.log("Data from for loop", dataWithForLoops);

    console.log("Data from map", dataWithMap);
};
