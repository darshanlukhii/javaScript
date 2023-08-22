let arr = [10, 15, 9, 3, 19, -2], count;
for (let i of arr) { count = 0
    for (let j of arr) (i >= j) ? count++ : null;
    (count <= 3) ? console.log("At-least three greaters are ::: " + i) : null;
}