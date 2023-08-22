// let A = "{[(( i+2 == 0 && i >= 3 || i <= 4 ) || ( j != 5 || j+3 > 10 || j+1 < 11 && j-- || j++ ))]}";
// let count = 0;
// console.log(" A :::  " + A);
// for (let i = 0; i < A.length; i++) {
//     if (A[i] == '(' || A[i] == '{' || A[i] == '[') {
//         count++;
//         continue;
//     } else if (A[i] == ')' || A[i] == '}' || A[i] == ']') {
//         count--;
//         continue;
//     }
// }
// (count == 0) ? console.log("IT'S BALANCE") : console.log("IT'S NOT BALANCE");

// if (((A[i] == "=" && A[i + 1] == "=") || (A[i] == "<" && A[i + 1] == "=") || (A[i] == ">" && A[i + 1] == "=") || (A[i] == "!" && A[i + 1] == "=") || (A[i] == "-" && A[i + 1] == "=") || (A[i] == "&" && A[i + 1] == "&") || (A[i] == "|" && A[i + 1] == "|") || (A[i] == "+" && A[i + 1] == "=") || (A[i] == "+" && A[i + 1] == "+") || (A[i] == "-" && A[i + 1] == "-")) && (A[i + 2] == " " && A[i + 3] != " " && (A[i - 1] == " " || A[i - 1] != " "))) {
// i++;
//     continue;
// }
// else if ((A[i] == ">" || A[i] == "<") && (A[i + 3] != " " && (A[i - 1] == " " || A[i - 2] != " "))) {
//     continue;
// }
// else if (((A[i] == "-") || (A[i] == "+") || (A[i] == "*") || (A[i] == "/") || (A[i] == "%") || (A[i] == "=") || (A[i] == "?") || (A[i] == "!") || (A[i] == "&") || (A[i] == "|")) && (A[i - 1] != " " && A[i + 1] != " ")) {
//     continue;
// }
// else if (((A[i] == "-") || (A[i] == "+") || (A[i] == "*") || (A[i] == "/") || (A[i] == "%") || (A[i] == "=") || (A[i] == "?") || (A[i] == "!") || (A[i] == "&") || (A[i] == "|")) && (A[i - 1] == " " && A[i + 1] == " ")) {
//     count++;
//     continue;
// }
// else if ((A[i] == ">" || A[i] == "<") && (A[i + 3] == " " && (A[i - 1] == " " || A[i - 2] == " "))) {
//     count++;
//     continue;
// }
// else if ((A[i] == "=" && A[i + 1] != "=") || (A[i] == "<" && A[i + 1] != "=") || (A[i] == ">" && A[i] != "=") || (A[i] == "!" && A[i + 1] != "=") || (A[i] == "-" && A[i + 1] != "=") || (A[i] == "&" && A[i + 1] != "&") || (A[i] == "|" && A[i + 1] != "|") || (A[i] == "+" && A[i + 1] != "=") || (A[i] == "+" && A[i + 1] != "+") || (A[i] == "-" && A[i + 1] != "-")) {
//     count++;
//     continue;
// }

// program to split array into smaller chunks

function splitIntoChunk(arr, chunk) {
  while (arr.length > 0) {
    let tempArray;
    tempArray = arr.splice(0, chunk);
    console.log(tempArray);
  }
}
const array = [1, 2, 3, 4, 5, 6, 7, 8];
const chunk = 2;
splitIntoChunk(array, chunk);