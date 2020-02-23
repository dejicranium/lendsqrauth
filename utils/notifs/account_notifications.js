const sendMail = require("./send");
let contexts = require('../../config/contexts');
let config = require('../../config')

exports.userDeactivated = async (user) => {
    const userEmailParams = {
        userName: `${user.first_name} ${user.last_name}`,
        loginURL: config.base_url
    };
    const adminEmailParams = {
        userName: `${user.first_name} ${user.last_name}`,
        userEmail: user.email,
        userNumber: user.phone,
        reasonDeactivated: user.status_reason
    }
    //Intentional fire and forget
    Promise.all([
        sendMail(contexts.admin_user_deactivated, config.admin_notification_email, adminEmailParams),
        sendMail(contexts.user_deactivated, user.email, userEmailParams)
    ]).catch(() => { });
}

exports.userReactivated = async (user) => {
    const userEmailParams = {
        userName: `${user.first_name} ${user.last_name}`
    };
    const adminEmailParams = {
        userName: `${user.first_name} ${user.last_name}`,
        userEmail: user.email,
        userNumber: user.phone,
        reasonDeactivated: user.status_reason
    }

    //Intentional fire and forget
    Promise.all([
        sendMail(contexts.admin_user_reactivated, config.admin_notification_email, adminEmailParams),
        sendMail(contexts.user_reactivated, user.email, userEmailParams)
    ]).catch(() => { });
}

exports.profileDeactivated = async (profile) => {
    const user = profile.user;
    const userEmailParams = {
        userName: `${user.first_name} ${user.last_name}`
    };

    const adminEmailParams = {
        userName: `${user.first_name} ${user.last_name}`,
        userEmail: user.email,
        userNumber: user.phone,
        userProfile: profile.role.name,
        reasonDeactivation: profile.status_reason
    }
    //Intentional fire and forget
    Promise.all([
        sendMail(contexts.user_deactivated, user.email, userEmailParams),
        sendMail(contexts.admin_user_deactivated, config.admin_notification_email, adminEmailParams)
    ]).catch(() => { })
}

exports.profileReactivated = async (profile) => {
    const user = profile.user;
    const userEmailParams = {
        userName: `${user.first_name} ${user.last_name}`,
        loginurl: config.base_url
    };

    const adminEmailParams = {
        userName: `${user.first_name} ${user.last_name}`,
        userEmail: user.email,
        userNumber: user.phone,
        userProfile: profile.role.name,
        reasonDeactivated: user.status_reason
    }

    //Intentional fire and forget
    Promise.all([
        sendMail(contexts.user_reactivated, user.email, userEmailParams),
        sendMail(contexts.admin_user_reactivated, config.admin_notification_email, adminEmailParams)
    ]).catch(() => { });
}

exports.userBlacklisted = async (user) => {
    const adminEmailParams = {
        userName: `${user.first_name} ${user.last_name}`,
        userEmail: user.email,
        userNumber: user.phone,
        reasonBlacklisted: user.status_reason
    }

    //Intentional fire and forget
    sendMail(contexts.admin_user_blacklisted, config.admin_notification_email, adminEmailParams).catch(() => { });
}
