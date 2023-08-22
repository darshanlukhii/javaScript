let a = "", b = 1, c = 1;
for (let i = 1; i <= 13; i++, a += "\n") for (let j = 1, b = i < 7 ? i : 14 - i, c = 1; j <= 13; j++) (j <= i && j <= 14 - i && j < 7) ? (((b == 1) ? a += b + " " : a += b + "-"), (b--)) : (j <= 6 + i && j <= 20 - i && j >= 7) ? (((c == 1) ? a += c : a += "-" + c), (c++)) : a += "  ";
console.log(a);