const ErrorLogger = require('mlar')('errorlogger');  
const Errorer = require('mlar')('errorer');
var morx = require('morx'); 
var q = require('q');

var spec = morx.spec({})  
                .build('test_param', 'required:true')
                .end(); 


function service(data) {

    let d = q.defer();
    let params = {};

    q
    .fcall( () => {

        let result = morx.validate(data, spec, {throw_error:false});
        if(!result.no_errors) {
          Errorer.throwError(result.error_messages, {code: 11});
        }
        params = result.params;
        //params.jk.l = 23;
        return params;
    }) 
    .then( created_log => {
        d.resolve(1);
    })
    .catch( e => {
        
        ErrorLogger(e, params.requestId);
        Errorer.handleError(d, e);

    })

    return d.promise;

}



service.morxspc = spec;
module.exports = service;

/*require('mlar')('service_tester')(service, {
    business_name:'Green Berg Inc',
    business_type:'e-commerce',
    email:Date.now()+"@kkk.com",
    password:'12345',
    meta:{collegue:124, debo:3940},
    country:'12345',
    public_key:'12345',
    secret_key:'12345',
    test_public_key:'12345',
    test_secret_key:'12345',
    contact_person:Date.now()+" Alaw",
}, false);*/
