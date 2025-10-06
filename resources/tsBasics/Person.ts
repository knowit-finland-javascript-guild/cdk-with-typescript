type Person = {
    firstName: string;
    lastName: string;
};

// Intersection type allows combining multiple types
export type PersonWithAge = Person & {
    age: number;
};

export const persons: Person[] = [
    {
        firstName: "First1",
        lastName: "Last1",
    },
    {
        firstName: "First2",
        lastName: "Last2",
    },
    {
        firstName: "First3",
        lastName: "Last3",
    },
];

export const personsWithAge: PersonWithAge[] = [
    {
        firstName: "First1",
        lastName: "Last1",
        age: 15,
    },
    {
        firstName: "First2",
        lastName: "Last2",
        age: 18,
    },
    {
        firstName: "First3",
        lastName: "Last3",
        age: 42,
    },
];
