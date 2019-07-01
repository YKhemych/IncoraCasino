module.exports.checkForRightNumber = (number) =>{
    if (number < 0 || number == "") {
        return false;
    } else {
        return !isNaN(number);
    }
}