let count = 0;
let fact = (number) =>{
   count++;
   console.log(count)
    if(number > 0)
    return number * fact(number-1);
    else
    return 1
}
let a1 = ""
for(let i=0; i<=9; i++){
    a1 += fact(2*i) / (fact(i+1) * fact(i)) + ",";
}
console.log("catalan series ::: " + a1);