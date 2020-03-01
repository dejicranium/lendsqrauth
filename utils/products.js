const models = require('mlar')('models');
const q = require('q');

function productHasActiveCollection(product) {
    if (product && product.collections && product.collections.length) {
        let collections = product.collections;
        for (let i = 0; i < collections.length; i++) {
            if (collections[i].status.toLowerCase() == 'active') {
                return true
            }
        }
        return false;
    }
}

function individualEligibleToCreateProduct(profileId, userId) {
    // get ban
    const d = q.defer();
    q.fcall(() => {
            let getbankdetails = models.user_bank.findOne({
                where: {
                    user_id: userId
                }
            });


            let getuser = models.user.findOne({
                where: {
                    id: userId
                }
            });


            return [getbankdetails, getuser]
        })
        .spread((bankDetails, user) => {
            if (!bankDetails || !bankDetails.id) throw new Error("You cannot add product until you register your bank details");
            let user_required_fields = ['first_name', 'last_name', 'phone'];

            user_required_fields.forEach(field => {
                if (!user[field]) {
                    throw new Error("Can't create product until profile information is completed")
                }
            });
            d.resolve('proceed')
        })
        .catch(error => {
            d.reject(error)
        })
    return d.promise

}


function businessEligibleToCreateProduct(profileId, userId) {
    // get ban
    const d = q.defer();
    q.fcall(() => {
            let getbankdetails = models.user_bank.findOne({
                where: {
                    user_id: userId
                }
            });
            let getuser = models.user.findOne({
                where: {
                    id: userId
                }
            });

            let getBusinessDetails = models.business_info.findOne({
                where: {
                    profile_id: profileId
                }
            })
            return [getbankdetails, getuser, getBusinessDetails]
        })
        .spread((bankDetails, user, businessDetails) => {
            if (!bankDetails || !bankDetails.id) throw new Error("You cannot add product until you register your bank details");
            if (!businessDetails || !businessDetails.id) throw new Error("You cannot add product until you register your business details");

            let user_required_fields = ['first_name', 'last_name', 'phone'];

            user_required_fields.forEach(field => {
                if (!user[field]) {
                    throw new Error("Can't create product until profile information is completed")
                }
            });

            let business_required_fields = ['business_name', 'tin_number', 'rc_number', 'business_address', 'state', 'country', 'business_phone']
            business_required_fields.forEach(field => {
                console.log('business field = ' + businessDetails[field])
                if (!businessDetails[field]) {
                    throw new Error("Can't create product until business information is completed")
                }
            });
            d.resolve('')
        })
        .catch(error => {
            d.reject(error)
        })
    return d.promise
}

module.exports = {
    productHasActiveCollection,
    individualEligibleToCreateProduct,
    businessEligibleToCreateProduct
}