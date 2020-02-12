module.exports = {
    calculate(amount) {
        amount = parseFloat(amount);
        let fee = (parseFloat(2/100) * amount) + 200 
        if (fee > 2000) {
            fee = 2000
        }
        return fee;
    }
}