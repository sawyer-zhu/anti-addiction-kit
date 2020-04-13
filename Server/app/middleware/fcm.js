const helper = require('../extend/help');
/**
 * 防沉迷检查
 * @param app
 * @returns {fcm}
 */
module.exports = app => {
    return async function fcm(ctx, next) {
        let body = ctx.request.body;
        let playLogs = body.play_logs;
        let userInfo = ctx.user;
        let age;
        let durationKey;

        if(!playLogs || playLogs.length == 0){
            ctx.status = 400;
            return ctx.body = {'error':'bad_credentials', 'error_description': 'Param error.'};
        }
        if(userInfo.identify_state == 1){
            age = helper.getAge(userInfo.identify);
            if(age >= 18){//18岁及以上不需要防沉迷
                return ctx.body = ({'status' : true});
            }
            durationKey = userInfo.identify;
        }else{
            durationKey = userInfo.user_id;
        }
        ctx.userInfo = { durationKey, identifyState: userInfo.identify_state, accountType: userInfo.account_type};
        await next();
    };
};