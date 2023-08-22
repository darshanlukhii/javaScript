let a = {
  firstname: "Darshan",
  surname: "Lukhi",
  age: "20",
  fullname: function () {
    return this.firstname + " " + this.surname + " " + this.age;
  },
};
// console.log(a.fullname());

let cars = { type: "white", model: "3500", color: "white" };

// console.log(cars)
// console.log(b)

let b =
  cars.type !== cars.color ? console.log(a.fullname()) : console.log(cars);
  cars.type === cars.color ? console.log(a.fullname()) : console.log(cars);
  cars.type === cars.color ? console.log(a) : console.log(cars);
// let b = (cars.type === cars.color) ? console.log(cars) : console.log(a);
