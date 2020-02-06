// var aws = require('aws-sdk');
// var multer = require('multer');
// var multerS3 = require('multer-s3');
// var accessKeyId = process.env.AWS_ACCESS_KEY;
// var secretAccessKey = process.env.AWS_SECRET_KEY;
// var md5 = require('crypto');

// var s3 = new aws.S3({
//     accessKeyId: accessKeyId,
//     secretAccessKey: secretAccessKey
// })
 
// var upload = multer({
//   storage: multerS3({
//     s3: s3,
//     acl: 'public-read',
//     bucket: process.env.BUCKETNAME,
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     cacheControl: 'max-age=31536000', //Cache for one year
//     metadata: function (req, file, cb) {
//       cb(null, {fieldName: file.fieldname});
//     },
//     key: function (req, file, cb) {
//       //console.log(file);
//       const filetp = file.mimetype.split('/').pop();
//       cb(null, req._$vnbreqid + '.'+filetp)
//     }
//   })
// })
// module.exports = upload.single('vnbfile');
module.exports = {};