const validator = require('mlar')('validators');

module.exports ={
    digitsOnly(entity, error=null, param=null) {
        if (!validator.isDigits(entity)) {
            if (error) throw new Error(error);
            const errorField = param ? param.toString() : entity;
            throw new Error(`${errorField} contains non-digits`);
        }
    },

    bvnFormatOnly(bvn, error=null, param=null){
        param =  'BVN';
        module.exports.digitsOnly(bvn, error, param);
        if (!validator.isOfLength(bvn, 11)) {
            throw new Error('BVN should be 11 digits');
        }
    },

    nubanFormatOnly(entity, error=null, param=null) {
        if (!validator.isNuban(entity)) {
            if (error) throw new Error(error);
            const errorField = param ? param.toString() : entity;
            throw new Error(`${errorField} is not in NUBAN format`);
        }
    },

    dateFormatOnly(entity, error=null, param=null) {
        if (!validator.isDate(entity)) {
            if (error) throw new Error(error);
            const errorField = param ? param.toString() : entity;
            throw new Error(`${errorField} should be in a date format`);
        }
    },

    emailFormatOnly(entity, error=null, param=null) {
        if (!validator.isEmail(entity)) {
            if (error) throw new Error(error);
            const errorField = param ? param.toString() : entity;
            throw new Error(`${errorField} is not a valid email format`);
        }
    },
    
    mustBeMutuallyExclusive(entities, error=null, params=null) {
        if (!validator.areMutuallyExclusive(entities)) {
            if (error) throw new Error(error);
            const errorFields = params.length ? params.map(param => param).join(', ') : entities.map(entity => entity).join(', ');
            throw new Error(`${errorFields} cannot be the same value`);
        }
    },

    mustBeValidPassword(password) {
        // lazily check;

        let oneUpperCaseCharacter = false;
        let oneLowerCaseCharacter = false;
        let oneSpecialCharacter = false;

        for (let i = 0; i < password.toString().length; i++) {
            let character = password.charAt(i);

            if (/[A-Z]/.test(character)) {
                oneUpperCaseCharacter = true;
            }
            else if (/[a-z]/.test(character)) {
                oneLowerCaseCharacter = true;
            }
            else if (/[0123456789!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(character)) {
                oneSpecialCharacter = true;
            }

            if (oneUpperCaseCharacter && oneLowerCaseCharacter && oneSpecialCharacter) {
                // can end loop
                return;
            }
        }

        if (!oneUpperCaseCharacter) throw new Error("Password must have at least one uppercase character");
        if (!oneLowerCaseCharacter) throw new Error("Password must have at least one lowercase character");
        if (!oneSpecialCharacter) throw new Error("Password must have at least one special character or digit");

    }
    
}
