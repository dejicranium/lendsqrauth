const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const bcrypt = require('bcrypt');
const validators = require('mlar')('validators');
const obval = require('mlar')('obval');
const assert = require('mlar')('assertions');
const crypto = require('crypto');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const moment = require('moment')

var spec = morx.spec({})
	.build('first_name', 'required:false,eg:lender')
	.build('last_name', 'required:false,eg:1')
	.build('business_name', 'required:false,eg:1')
	.build('email', 'required:false,eg:1')
	.build('phone', 'required:false,eg:1')
	.build('image', 'required:false,eg:1')
	.end();

function service(data) {

	var d = q.defer();

	q.fcall(async () => {
			var validParameters = morx.validate(data, spec, {
				throw_error: true
			});
			let params = validParameters.params;
			if (!Object.keys(params).length) {
				throw new Error("Please enter a value to update");
			}



			return models.user.findOne({
				where: {
					id: data.user.id
				}
			})
		})
		.then(async (user) => {
			if (!user) throw new Error(`Could not find user`);
			await user.update(data)
			d.resolve("Successfully updated user")

		})
		.catch((err) => {

			d.reject(err);

		});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;