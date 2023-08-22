let ourTuple: [string, boolean, number];
ourTuple = ["hi,i am hear", false, 1412];         //ourTuple = [false, "hi,i am hear", 5]
console.log(ourTuple);

//------> Readonly Tuple
let ourTuple1: [string, boolean, number];
ourTuple1 = ["hi,i am hear", false, 1412];
//We have no type safety in our tuple for indexes 3+; 
ourTuple1.push("ABCD");                        
console.log(ourTuple1);


//------> Named Tuples
let abc: [x: number, y: string] = [55.2, "hi, Dosto"];
console.log(abc)
