let a = "";
for (let i = 1; i <= 25; i++,a += "\n"){
    if(i % 3 == 0 && i % 5 == 0) a += i + " _________________35 --!";
    else if(i % 3 == 0) a += i + " ! ...3!";
    else if(i % 5 == 0) a += i + " !.....5.....!";
    else a += i + " SB";
}
console.log(a);