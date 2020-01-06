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

module.exports = {
    productHasActiveCollection
}