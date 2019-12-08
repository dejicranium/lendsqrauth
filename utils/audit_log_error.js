class InexistentTable extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, InexistentTable);
    }
}

module.exports = {
    InexistentTable
}