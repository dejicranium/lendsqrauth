const models = require('mlar')('models');
const q = require('q'); 
const paginate = require('mlar')('paginate');
const moment = require('moment');

function service(data){

    const d = q.defer();
    
    const page = data.page ? Number(data.page) : 1;
    const limit = data.limit ? data.limit : 20;
    const offset = page ? (page - 1) * limit : false;	
    
    
    let params = {};
    params.limit = limit;
    params.offset = offset;
    params.attributes = {};
    params.attributes.exclude = ['password'];

    // include role 
    params.include = [{model: models.profile}];

    // for filter conditions 
    params.where = {

    }
    
    if (data.first_name) {
        params.where.first_name = {
            $like: '%' + data.first_name + '%'
        }

    }
    if (data.last_name) {
        params.where.last_name = {
            $like: '%' + data.last_name + '%'
        }
    }
    if (data.phone) {
        params.where.phone = {
            $like: '%' + data.phone + '%'
        }
    }
    if (data.email) {
        params.where.email = {
            $like: '%' + data.email + '%'
        }
    }
    if (data.business_name) {
        params.where.business_name = {
            $like: '%' + data.business_name + '%'
        }
    }

    if (data.role) {
        params.include[0].where = data.role;
    }
    /*
    if (data.active) {
        params.where.active = 1;
    }
    
    if (data.disabled) {
        params.where.disabled = 1;
    }
    if (data.deleted) {
        params.where.deleted = 1;
    }
    if (data.from && data.to) {
        let start = moment(moment(data.from).format('YYYY-MM-DD') + ' 00:00:00', moment.ISO_8601) 
        let stop = moment(moment(data.to).format('YYYY-MM-DD') + ' 23:59:59', moment.ISO_8601) ;
        
        params.where.created_on = {
            $gte: start.toISOString(), $lte: stop.toISOString()   
        }   
    }
*/
    q.fcall( async () => {
        return models.user.findAndCountAll(params)
	}) 
	.then((users) => { 
        if (!users) throw new Error("Couldn't fetch users");
        d.resolve(paginate(users.rows, 'users', users.count, limit, page))
    })
	.catch( (err) => {
		d.reject(err);
	});

	return d.promise;

}
module.exports = service;
