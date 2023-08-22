let a = '';
for (let i = 1; i <= 13; i++, a += "\n")for (let j = 1; j <= 7; j++)(j >= i || j >= 14 - i) ? (j == 7) ? a += j : a += j + "-" : a += " ";
console.log(a)