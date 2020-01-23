module.exports = function (req, res, next) {
    if (req.user) {
        res.userId = req.user.id;
    }
    if (req.profile) {
        res.profileId = req.profile.id;
    }
    next();
}