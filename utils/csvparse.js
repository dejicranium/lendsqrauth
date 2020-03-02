const request = require('request');
const csv = require('csvtojson/v1');
const q = require('q');

function parse_csv (url) {
    const d = q.defer();

    console.log(url);
    let bulk_data = [];
    csv({trim: true}).fromStream(request.get(url))
    .on('json', (json_object, i) => {
        console.log(json_object);
        bulk_data.push(json_object);
    })
    .on('done', error => {

        console.log(error, 'here');
        if(!error) d.resolve(bulk_data);
        else d.reject(error.message);

    })

    return d.promise;
}
module.exports = parse_csv;