
// let arr = [1,41,23,8,3,5,89,3]

// console.log(arr)
// console.log(arr[0])
// console.log(arr.toString())
// console.log(arr.join("-"))

// let arr1 = [1,41,23,8,3,5,89,3]

// console.log(arr1.reverse())
// arr1.splice(2,4,120,3652,5263,4589)
// console.log(arr1)


const fruits = ["Banana", "Orange", "Apple", "Mango"];
let fruit = fruits.shift();
fruits.shift()
console.log(fruits)


const fruits1 = ["Banana", "Orange", "Apple", "Mango"];
fruits1.unshift("Lemon");
console.log(fruits1.unshift("Lemon"))

let fruit3 = ["Banana", "Orange", "Apple", "Mango"]
console.log("original array ::: \n" + fruit3)

let removed = fruit3.splice(2, 2, "Lemon", "kiwi");

console.log("new one Array :::\n" + fruit3)
console.log("removed :::\n" + removed)

let fruit4 = ["Banana", "Orange", "Apple", "Mango"];
let remove = fruit4.splice(0, 2);
console.log(remove)
console.log(fruit4)
