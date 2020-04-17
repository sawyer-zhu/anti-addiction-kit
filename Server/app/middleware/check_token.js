/**
 * 检查jwt token
 * @param app
 * @returns {checkToken}
 */
module.exports = app => {
    return async function checkToken(ctx, next) {
        let user;
        let payload
        let accessToken = ctx.header.authorization;

        if (!accessToken || accessToken.length == 0) {
            ctx.status = 400;
            return ctx.body = ({'error':'bad_credentials', 'error_description': '无效的access_token.'});
        }
        try{
            payload = await app.jwt.verify(accessToken.split(' ')[1], app.jwt.secret)  // // 解密，获取payload
        }catch(error){
            return ctx.body = ({'error':'bad_credentials', 'error_description': '无效的access_token.'})
        }

        let antiAddictionKit = app.mysql.get('anti_addiction_kit_server');
        user = await antiAddictionKit.get('user_info', { id: payload.id});
        if(user == null){
            ctx.status = 404;
            return ctx.body = ({'error':'bad_credentials', 'error_description': '用户不存在.'});
        }
        ctx.user = user;
        await next();
    };
};