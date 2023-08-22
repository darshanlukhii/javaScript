let a = new Date();
console.log(a.toString())

let a1 = new Date("October 13, 2014 11:13:00");
let a11 = new Date("2022-03-25");
let a111 = new Date(2022, 11, 28, 10, 33, 30);      //--> JavaScript counts months from 0 to 11: January = 0. December = 11.
let a2 = new Date("2015-03-25");
console.log(a1)
console.log(a11.toString())
console.log(a111.toISOString())
console.log(a2.toDateString())
console.log(a2.getFullYear())
console.log(a2.getMonth())
console.log(a2.getDate())
console.log(a111.getHours())

let year = () => {
    let a = new Date(1913, 1, 29).getDate() == 29;
    return (a) ? console.log(' is a leap year') : console.log(' is not a leap year');
}
year();
// const year = prompt("dfhdjdgfdhfd");