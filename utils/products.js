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

function businessLenderEligibleToCreateProduct(profileId, userId) {
    // get ban
    const d = q.defer();
    q.fcall(() => {
            let getbankdetails = models.user_bank.findOne({
                where: {
                    user_id: userId
                }
            });

            let getBusinessDetails = models.business_info.findOne({
                where: {
                    profile_id: profileId
                }
            })
            return [getbankdetails, getBusinessDetails]
        })
        .spread((bankDetails, businessDetails) => {
            if (!bankDetails || !bankDetails.id) throw new Error("You cannot add product until you register your bank details");
            if (!businessDetails || !businessDetails.id) throw new Error("You cannot add product until you register your business details");

            if
        })
}

module.exports = {
    productHasActiveCollection
}