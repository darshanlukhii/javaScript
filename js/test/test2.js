console.log("Largest element ......  :" + Math.max.apply(null, [20, 10, 20, 4, 100].map((a1) => a1)))

/* 
let arr = [20, 10, 20, 4, 100]
console.log(Math.max(...arr))
console.log(Math.max(20, 10, 20, 4, 100))
let arr1 = [200, 1000, 20, 40, 100]
console.log(Math.max.apply(arr, arr1))
console.log([20, 10, 20, 4, 100].sort((x, y) => y - x)[0])
*/