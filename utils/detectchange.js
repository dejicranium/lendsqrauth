function util(old_data, new_data) {
    let fields = Object.keys(old_data);
    let proceed = false;

    for (let i = 0; i < fields.length; i++) {
        let field = fields[i];
        if (new_data[field] && new_data[field] !== old_data[field]) {
            proceed = true;
            break;
        }
    }

    return proceed;
}

module.exports = util;