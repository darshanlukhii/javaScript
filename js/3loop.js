// for (let i = 0; i < 5; i++) {
//     console.log(i);
// }

// // in -----

// const person = { fname: "John", lname: "Doe", age: 25 };

// for (let a in person) {
//     console.log(person[a]);
// }

// for (let a in person) {
//     console.log(a);
// }

// //of ----------

// const person1 = ["John", 15, "why"];
// for (let a of person1) {
//     console.log(a);
// }

// let ab = "ram mar";
// for (let a of ab) {
//     console.log(a);
// }

// let a = "", b = 1;
// for (let i = 1; i <= 7; i++, a += "\n") for (let j = 1, b = 1; j <= 4; j++) (j >= 5 - i && j >= i - 3) ? (i == 1 || i == 7 || j == 4) ? (a += b) : ((a += b + "---"), (b++)) : a += "  ";
// console.log(a);

const array = [
    {
      text: "I am currently working for this employer/facility",
      attribute: "availability_already_joined"
    },
    {
      text: "I am not interested in working for this Employer/Facility",
      attribute: "dislike_employer"
    },
    {
      text: "I don’t have a license in this location",
      attribute: "license_revoked"
    },
    {
      text: "This position is too far from my preferred area/location",
      attribute: "location_city_distance"
    },
    {
      text: "There are not enough details about the position",
      attribute: "not_enough_detail"
    },
    {
      text: "Pay rate is too low",
      attribute: "pay_low"
    },
    {
      text: "I am not interested in travel positions. I prefer local positions",
      attribute: "prefer_local_position"
    },
    {
      text: "I am only interested in travel/contract positions",
      attribute: "prefer_travel_position"
    },
    {
      text: "Occupation and/or Specialty is not relevant to me",
      attribute: "specialty_mismatch"
    },
  ];
  
  const object = {};
  for (const item of array) {
    object[item.attribute] = false;
  }
  
  console.log(object);
  