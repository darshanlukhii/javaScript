/*
let arr = [23, 546, 8, 4, 3, 5, 6, 7, 45, 65, 34]
let compare1 = (a, b) => { 
    return b - a 
}
let a = arr1.sort((a, b) => { 
    return b - a 
})
console.log(arr1)*/
console.log([23, 546, 8, 4, 3, 5, 6, 7, 45, 65, 34].filter((value) => { return value > 10 }).sort((a, b) => { return b - a }))


/*let arr2 = arr.filter((value) => {
    return value < 10
})
let compare = (x, y) => {
    return x - y
}
let b = arr2.sort(compare)
console.log(arr2)*/
console.log([23, 546, 8, 4, 3, 5, 6, 7, 45, 65, 34].filter((value) => { return value > 10 }).sort((x, y) => { return x - y }))
