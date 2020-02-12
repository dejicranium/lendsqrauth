module.exports = {
    calculate(amount) {
        amount = parseFloat(amount);

        let fee = (parseFloat(2/100) * amount) + 200 

        return fee;
    }
}