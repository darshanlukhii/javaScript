let cars = 5;
let totalSeat = [7, 3, 4, 1, 2]  //-----> 17
let person = [5, 3, 3, 1, 0];  //---> 12

totalSeat.sort((a, b) => { return b - a });
console.log(totalSeat);

let totalPeople = person.reduce((a, b) => a + b, 0);
console.log(totalPeople);

let totalCars = 0;
while (totalPeople >= 1) {
    if (totalPeople > 17) {
        console.log("Sorry, Bro ......");
        break;
    }
    totalPeople = totalPeople - totalSeat[totalCars];
    totalCars++;                 // 12 - 7 == 5 ----> count -1       5 - 4 == 1 ----> count -2       1 - 3 ==  ----> count -3
}
console.log("Total cars ::: " + totalCars);