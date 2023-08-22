let a = "", b = 65, c = 1;
for (let i = 1; i <= 13; i++, a += "\n")for (let j = 1, b = i < 7 ? 64 + i : 64 + (14 - i), c = i < 7 ? i : 14 - i; j <= 7; j++)(j <= 8 - i || j <= i - 6) ? (((i % 2 != 0) ? (j % 2 != 0) ? a += String.fromCharCode(b) + " " : a += c + " " : (i % 2 == 0) ? (j % 2 == 0) ? a += c + " " : a += String.fromCharCode(b) + " " : null), (b++, c++)) : null;
console.log(a)