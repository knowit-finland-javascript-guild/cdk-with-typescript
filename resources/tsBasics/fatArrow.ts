// Fat arrow function is a shorthand for creating a function
// It has some small differences with the regular function expression for example how `this` behaves

// A regular function expression
function greet() {
    console.log("Greetings");
}

const greet2 = () => {
    console.log("Greetings2");
};

// Helps keep the code neat when using lots of anonymous inner functions
const numbers = [1, 2, 3, 4];

const sum = numbers.reduce(function (prev, curr) {
    return curr + prev;
});

const sum2 = numbers.reduce((prev, curr) => {
    return curr + prev;
});

// Can also make use of implicit returns
const sum3 = numbers.reduce((prev, curr) => curr + prev);

export const executeFatArrow = () => {
    console.log("");
    console.log("Starting fat arrow example");
    console.log("");

    greet();
    greet2();
    console.log(sum);
    console.log(sum2);
    console.log(sum3);
};
