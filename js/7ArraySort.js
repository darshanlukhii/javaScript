let arr = [1, 41, 23, 8, 3, 5, 89, 3];
// let compare1 = (a, b) => {
//     return a - b;
// }
console.log(arr.sort((a,b)=>(a-b)));

let compare2 = (a, b) => { return b - a }
let c = arr.sort(compare2);
console.log(c);

const fruits = ["Banana", "Orange", "Apple", "Mango"];
console.log(fruits);
fruits.sort();
console.log(fruits);
fruits.reverse();
console.log(fruits);
