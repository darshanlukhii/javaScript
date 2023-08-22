let ar1: string = " 16, 12, 14, 10"
console.log(ar1)

const A1: { firstname: string, lastname: string, age: number } = {
    firstname: "darshan",
    lastname: "Lukhi",
    age: 21
};
console.log(A1)


//--------> Example with any
let A: any = true;
A = "string";

console.log(Math.round(A));


// --------> Type: never             never effectively throws an error whenever it is defined.
// let x1: never = true;


//--------> Type: undefined & null   
let B: undefined = undefined;
console.log(typeof B);

let C: null = null;
console.log(typeof C);

class Person {
    private readonly name: string;

    public constructor(name: string) {
        // name cannot be changed after this initial definition, which has to be either at it's declaration or in the constructor.
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }
}

const person = new Person("Jane");
console.log(person.getName());