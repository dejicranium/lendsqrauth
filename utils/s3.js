var q = require('q');
var morx = require('morx');
var AWS = require('aws-sdk');
var config = require('../config')

var spec = morx.spec({})
    .build('data', 'required:true, eg:16')
    .build('filename', 'required:false, eg:16')
    .end();


function service(data) {

    var d = q.defer();
    var accessKeyId = config.aws_access_key;
    var secretAccessKey = config.aws_secret_key;
    var s3BASE = config.aws_s3base_url;

    q
        .fcall(() => {

            var result = morx.validate(data, spec, {
                throw_error: true
            });

            return result.params;

        })
        .then((serviceparams) => {

            var d2 = q.defer();
            AWS.config.update({
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey
            });

            var s3 = new AWS.S3();

            serviceparams.filename = serviceparams.filename || Date.now() + '_0_0_';
            var params = {
                ACL: 'public-read',
                Bucket: 'lendsqr-files',
                Key: serviceparams.filename,
                Body: serviceparams.data
            };

            s3.putObject(params, function (perr, pres) {
                if (perr) {
                    console.log("Error uploading data: ", perr);
                    d.reject(perr);
                } else {
                    console.log(pres);
                    d2.resolve(s3BASE + serviceparams.filename);
                    console.log("Successfully uploaded data to myBucket/myKey");
                }
            });

            return d2.promise;

        })
        .then(link => {
            d.resolve(link);
        })
        .catch((e) => {

            d.reject(e);

        })

    return d.promise;

}
service.morxspc = spec;
module.exports = service;