let a = "", b = 65, c = 1;
for (let i = 1; i <= 13; i++, a += "\n")for (let j = 1, c = 1, b = 65; j <= 7; j++, c++, b++)(j >= i || j >= 14 - i) ? (i % 2 == 0) ? (j % 2 == 0) ? a += String.fromCharCode(b) + " " : a += c + " " : (i % 2 != 0) ? (j % 2 != 0) ? a += String.fromCharCode(b) + " " : a += c + " " : null : a += " ";
console.log(a);