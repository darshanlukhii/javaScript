let a = "Lukhi. Darshan is Name My Hy!";
let b = "";
for (let i = a.length; i >= 0; i--) if (a[i] == " " || i == 0) {
    for (let j = (i == 0 ? i : i + 1); j < a.length; j++) {
        if (a[j] == " ") break;
        b += a[j];
    }
    b += " ";
}
console.log(b);