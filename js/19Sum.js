const arr = [1, 2, 3, "array", true, { a: 1, b: 2 }, { z: "hi" }, 6, [{ a: 1, b: "hi", c: 3 }, { b: 1 }, 10, 20], [2, "hi", 3, 15], [{ a: 1 }]]
let Sum = 0;
for (let value of arr) {
    if (typeof (value) == "number") Sum += value;
    if (typeof (value) == "object") {
        if (value.length > 0) {
            for (let x of value) if (typeof (x) == "number") Sum += x;                                             //---> for array of objects ....
            for (let x of value) for (let number in x) if (typeof (x[number]) == "number") Sum += x[number];       //---> for array ....
        } else {
            for (let number in value) if (typeof (value[number]) == "number") Sum += value[number];                //---> for single objects .....
        }
    }
}
console.log("The Total Sum is ::: " + Sum);