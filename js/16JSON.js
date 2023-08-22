
let tax = '{"name": "john", "age": 30, "city": "Surat"}'
let obj = JSON.parse(tax)
console.log(obj)
console.log(obj.name)
console.log(obj.age)
console.log(obj.city)


let tet = '{"name":"darshan","birth":"2001-12-14","city":"surat"}';
let obj1 = JSON.parse(tet);
obj1.birth = new Date(obj1.birth);
console.log(obj1)
console.log(obj1.name + ", " + obj1.birth)


let text = '{"name":"darshan","birth":"2001-12-14","city":"surat"}';
let obj2 = JSON.parse(text, function (key, value) {
    if (key == "birth") {
        return new Date(value);
    } else {
        return value;
    }
});
console.log(obj2)


let tet1 = { "name": "darshan", "birth": "2001-12-14", "city": "surat" };
let obj3 = JSON.stringify(tet1);
obj1.birth = new Date(obj3.birth);
console.log(obj3)


let obj4 = { name: "John", age: 30, city: "New York" };
let myJSON = JSON.stringify(obj4);
console.log(myJSON)


let myJSON1 = '{"name":"John", "age":30, "cars":["Ford", "BMW", "Fiat"]}';
const myObj = JSON.parse(myJSON1);
console.log(myObj)
let y = myJSON1.split("")
let z = y.reverse();
let x = z.join("")
console.log(x)


let myjson1 = `{"name":"darshan","age":"30","cars":"2"}`
console.log(myjson1)
console.log(myjson1.length)
