/**
 * When a user wishes to invite a borrower, is the following the flow? 

    He creates a product and then a collection. To invite the borrower, he'll be told to input the name of the collection. we'll keep this the identity of this collection in mind. When a user registers, the first thing place he'll be taking to is the page showing that collection
 */

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
			   .build('email', 'required:false, eg:1')   
			   .build('collection_id', 'required:false, eg:1')   
			   .end();

function service(data){

	var d = q.defer();
	const globalProfileId = data.PROFILE_ID || 1;
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
        
        // through the email, find out  whether user already exist

        return [  models.collection.findOne({where: {id: collection_id}}), params]
		
	}) 
	.then(async (collection) => { 

        if (!collection) throw new Error("No such collection");
        let randomBytes = await crypto.randomBytes(32).toString('hex');

        let createInvitation = models.invitation.create({
            token:  randomBytes
        });


        // prepackage the link to the collection 
        let baseLink  = config.frontendBaseUrl + `/invites/borrowers?token=${token}&id=${invitation.id}`;
        let urlqueryString = `?attached_coll=${params.collection_id}`;
        
        let emailLink = baseLink + urlqueryString;    

        // send link to users
        
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
