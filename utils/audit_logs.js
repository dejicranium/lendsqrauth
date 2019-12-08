const errors = require('./audit_log_error')
const sequelize = require('sequelize');
class AuditLog {
    constructor(tableName, instance, options = {}) {
        this.table = tableName;
        this.model = model;
        this.instance = instance;
        this.options = options;
    }
}