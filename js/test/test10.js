let ascii = (x) => String.fromCharCode(64 + x), a = "";
for (let i = 1; i <= 13; i++, a += "\n") for (let j = 1; j <= 7; j++) (j <= 8 - i || j <= i - 6) ? i % 2 == 0 ? j % 2 == 0 ? a += ascii(j) + " " : a += j + " " : j % 2 != 0 ? a += ascii(j) + " " : a += j + " " : null;
console.log(a)