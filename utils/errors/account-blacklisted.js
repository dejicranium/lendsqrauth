class AccountBlacklisted extends Error {
    constructor(message) {
        super(message);
    }
}
module.exports = AccountBlacklisted;