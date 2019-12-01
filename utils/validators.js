module.exports = {
    isDigits(entity) {
        return /^\d+$/.test(entity);
    },

    isDigitsOrDecimal(entity) {
        return /^[1-9]\d*(\.\d+)?$/.test(entity)
    },

    isOfLength(entity, length) {
        length = parseInt(length);
        entity = entity.toString();
        return entity.length == length;
    },

    isNuban(accountNumber) {
        const self = this; 
        return self.isDigits(accountNumber) && self.isOfLength(accountNumber, 10);
    },

    isDate(date) {
        date = new Date(date)
        date = date.toString().toLowerCase();
        
        return date != 'invalid date';  
        
    },
    isEmail(string) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(string).toLowerCase());
        
    },
    areMutuallyExclusive(values) {
        // if original length of values is not the same as the size of the set, it means some values are not unique
        return values.length == new Set(values).size;
        
    },
}

