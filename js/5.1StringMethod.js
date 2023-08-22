// let a = "Darshan";

// console.log(a.length);
// console.log(a.toUpperCase());
// console.log(a.toLowerCase());
// console.log(a.charAt(5));
// console.log(a.includes("rsh"));
// console.log(a.endsWith("n"));
// console.log(a.localeCompare(3));

// let text = "Apple, Banana, Kiwi";
// console.log(text.slice(7, 13));

// let Darshan = "name, surname, age";
// console.log(Darshan.substring(6, 13));

// console.log(Darshan.substr(6, 16));
// console.log(Darshan.substr(-9));
// console.log(Darshan.trim());
// console.log(Darshan.padStart(4, "m"));

let a1 = "011010101"
let b = a1.split("0"), c = a1.split("1");
for(let i=0; i<=(b.length-1); i++) {
    if(b[i]!="") console.log(b[i])
    if(c[i]!="") console.log(c[i])
}