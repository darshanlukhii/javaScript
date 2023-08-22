// function ---------
function toCelsius(fahrenheit) {
  return (5 / 9) * (fahrenheit - 32);
}
console.log(toCelsius(77));

function abc(x, y, z) {
  return x + y - z;
}
console.log(abc(10, 20, 15));

// current type of funaction ---------

const hello = () => {
  console.log("hello, how are you , i am toh fine !");
};
console.log(hello());

const sum = (a, b) => {
  return a ** b;
};
console.log(sum(20, 2));
