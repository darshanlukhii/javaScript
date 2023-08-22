let arr = [11, 22, 33, 44, 55, 66, 77, 88, 09, 180]

const a = (a, b) => {
    return a += b
}

let arr1 = arr.reduceRight((a, b, c, d) => {
    console.log(a,b, c, d)
    return b,c,d;
})
let arr2 = arr.reduce((a, b, c, d) => {
    console.log(a,b, c, d)
    return b,c,d;
})
// let arr2 = arr.every((a))
// let arr3 = arr.some((a))
// let arr1 = arr.reduce((a,b) => {
//     return a + b
// })

console.log(arr1)
console.log(arr2)
// console.log(arr3)
