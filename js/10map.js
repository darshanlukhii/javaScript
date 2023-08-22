
let arr = [23, 57, 34, 86, 35, 78]

// const { stringify } = require("querystring")

let arr1 = arr.map((value, index, array) => {
    console.log(index, array)
    // return value, index, array
})

// let a = [
//     { firstName: "John", lastName: "Doe", id: 5566 },
//     { firstName: "Darshan", lastName: "Lukhi", id: 55 },
//     { firstName: "sahil", lastName: "Savaliya", id: 987 },
//     { firstName: "John", lastName: "Doe", id: 5566 },
//     { firstName: "Darshan", lastName: "Lukhi", id: 55 },
//     { firstName: "sahil", lastName: "Savaliya", id: 987 },
//     { firstName: "John", lastName: "Doe", id: 5566 },
//     { firstName: "Darshan", lastName: "Lukhi", id: 55 },
//     { firstName: "sahil", lastName: "Savaliya", id: 987 },
//     { firstName: "John", lastName: "Doe", id: 5566 },
//     { firstName: "Darshan", lastName: "Lukhi", id: 55 },
//     { firstName: "sahil", lastName: "Savaliya", id: 987 },
//     { firstName: "John", lastName: "Doe", id: 5566 },
//     { firstName: "Darshan", lastName: "Lukhi", id: 55 },
//     { firstName: "sahil", lastName: "Savaliya", id: 987 },
//     { firstName: "John", lastName: "Doe", id: 5566 },
//     { firstName: "Darshan", lastName: "Lukhi", id: 55 },
//     { firstName: "sahil", lastName: "Savaliya", id: 987 },
//     { firstName: "John", lastName: "Doe", id: 5566 },
//     { firstName: "Darshan", lastName: "Lukhi", id: 55 },
//     { firstName: "sahil", lastName: "Savaliya", id: 987 },
//     { firstName: "John", lastName: "Doe", id: 5566 },
//     { firstName: "Darshan", lastName: "Lukhi", id: 55 },
//     { firstName: "sahil", lastName: "Savaliya", id: 987 },
//     { firstName: "John", lastName: "Doe", id: 5566 },
//     { firstName: "Darshan", lastName: "Lukhi", id: 55 },
//     { firstName: "sahil", lastName: "Savaliya", id: 987 },
//     { firstName: "John", lastName: "Doe", id: 5566 },
//     { firstName: "Darshan", lastName: "Lukhi", id: 55 },
//     { firstName: "sahil", lastName: "Savaliya", id: 987 },
//     { firstName: "John", lastName: "Doe", id: 5566 },
//     { firstName: "Darshan", lastName: "Lukhi", id: 55 },
//     { firstName: "sahil", lastName: "Savaliya", id: 987 },
// ]
// let b = a.map((value, index, array) => {
//     return `${index + 1} : My firstName is ${value.firstName}, My lastName is ${value.lastName}, My id is : ${value.lastName}.`;
// });
// // let c = b.toString()
// console.log(b)
