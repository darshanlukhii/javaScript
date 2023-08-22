class car {
  constructor(name, year) {
    this.name = name;
    this.year = year;
  }
  age() {
    let date = new Date();
    return date.getFullYear();
  }
}
// let myCar = new car("Ford", 1914)
// console.log(myCar.age())

// function person(a, b, c, d) {
//   this.firstname = a;
//   this.lastname = b;
//   this.age = c;
//   this.colour = d;
// }
// let obj = new person("DArshan", "Lukhi", 20, "blue");
// console.log(obj.firstname + " " + obj.lastname + " " + obj.age + " " + obj.colour)

let myCar = new car ("ford", 1914)
console.log(myCar.age())

const person =(a, b, c, d) => {
  this.firstName =a;
  this.lastName = b;
  this.age =c;
  this.color = d;
}