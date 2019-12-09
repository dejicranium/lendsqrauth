const errors = require('./audit_log_error')
const sequelize = require('sequelize');
class AuditLog {
    constructor(model, tableName, instance, mappings, options = {}) {
        this.table = tableName;
        this.model = model;
        this.instance = instance;
        this.options = options;
        this.mappings = {};
        this.action = 'update';
    }

    create() {
        let store = {};
        // get stores from mapping 
        this.mappings.forEach(map => {
            if (map['action']) store[map['action']] = instance.action
            n
        })
        // spits out from the 
        return model[tableName].create()
    }
}