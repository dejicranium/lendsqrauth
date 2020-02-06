var q = require('q');
var models = require('mlar')('models');
var s3 = require('../utils/s3');
var json2csv = require('json2csv').parse;
var md5 = require('md5');
var mlite = require('mlite')('59103fd9906c970004605ab4');


module.exports = function (model, user_id, template_id = null, extras_func = null, file_name = null, fields = false) {

    var d = q.defer();
    var filename = file_name || md5(Date.now()) + "-" + md5(Math.random()) + ".csv";
    console.log(model)
    // var adbookwhere = { AccountId:accountid };
    // if(user_id) adbookwhere = { user_id:user_id };

    //mlite.info([ accountid, user_id, adbookwhere], "SEND-CSV-INIT");

    q.fcall(() => {

            return models.user.findOne({
                where: {
                    id: user_id
                },
                attributes: ['email'],
                raw: true
            })

        })
        .then((user) => {
            if (model.length === 0) {
                throw new Error('NO DATA FOUND')
            }
            var search = {
                data: model
            }
            if (fields) {
                search.fields = fields
            }
            json2csv(search, function (err, csv) {

                if (err) {
                    console.log(err)
                }

                console.log(csv)
                s3({
                        data: csv,
                        filename: filename
                    })
                    .then(downloadlink => {
                        //mlite.info([1, downloadlink], "CSV-DOWNLOAD-LINK");
                        models.download.create({
                            file: filename,
                            url: downloadlink,
                            user_id: user_id
                        });


                        if (extras_func) {
                            extras = extras_func(model);
                        }

                    })
                    .catch(e => {
                        models.download.create({
                            file: filename,
                            url: 'undefined',
                            user_id: user_id
                        });

                        mlite.errorX(e, "S3-UPLOAD-ERROR-CC");

                    })

                d.resolve(1);

            });


        }).catch(function (err) {

            models.download.create({
                file: filename,
                url: 'undefined2',
                user_id: user_id
            });
            d.reject(err);
        })


    return d.promise;
}