var array = ["work","study","hobby","life","social","entertainment","exercise","school","productivity","sleep"]
for(var i = 0; i < array.length; i ++) {
    array[i] = array[i].charAt(0).toUpperCase() + array[i].slice(1);
}
console.log(array);