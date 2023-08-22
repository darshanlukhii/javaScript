let array : string [] = [];
array.push("Darshan");
array.push("3");       //array.push(3)
console.log(array);


//----> Type Inference
let n = [1,2,3,4,5,6];
n.push(10,20,30);
n.push(500);           //n.push("500")
console.log(n);
let n1:number = n[2];
console.log(n1);
