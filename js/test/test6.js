let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], b = 8, count = 0, a = "", arr1 = [];
for (let i = 0; i < arr.length; i++) (i >= arr.length - b) ? arr1[i] = arr[count++] : arr1[i] = arr[b + i];
console.log(arr1);