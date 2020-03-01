const hasher = require('crypto').createHash;

function get_string_to_hash(hash_fields, hash_key, data) {
    let key_values = [];
    hash_fields.forEach(field => {
        key_values.push(data[field]);
    });
    const string_to_hash = key_values.join('') + hash_key;
    return string_to_hash;
}
function generate_hash(hash_fields, hash_key, data) {
    const string_to_hash = get_string_to_hash(hash_fields, hash_key, data);
    console.log(string_to_hash);
    return hasher('sha512').update(string_to_hash).digest('hex');
}

function verify_hash(hash_fields, hash_key, hash_to_verify, data) {
    const hash = generate_hash(hash_fields, hash_key, data);
    console.log(hash);
    console.log(hash_to_verify);
    return hash === hash_to_verify;
}

module.exports = {
    verify_hash,
    generate_hash
};
// const testdata = {a:234, b:3}
const requestId = `RID${Date.now()}`;

const hashmap = ['requestId', 'amount', 'accountNumber'];
var payload = {
	"accountNumber":"8000000040",
	"sourceBankCode":"099",
	"sourceBankAccount":"20192020293",
	"sourceAccountName":"Aderibigbe Moshood",
	"amount":4500,
    "sourceBVN":"0192020293",
    "requestId":"TX_REQUEST_HASHED_01",
	"currency":"NGN",
	"NIPSessionID":"NIPID{{request_id}}"
	
}
payload.requestId = requestId;
payload.hash = generate_hash(hashmap, 'vb_as_58b2dc0520c170ffa5fb537becd0797b0596497300f8', payload)
console.log(JSON.stringify(payload, null, 2));
// verify_hash(['a'], 'vnbn_0390amd9938', '29d1a90b0022b8884791ae5d7f5ca5e00e9a191127faf546cfe5b4408bd8719e08ab85c29ab8eb1563eba4fa81951572eeb0ab0a114cf9e9aadcf9c21e4463a8', {a:234, b:3});