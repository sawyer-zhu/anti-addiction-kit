const helper = require('../../extend/help');
const encrypt = require('../../extend/encrypt');

const Controller = require('egg').Controller;
class AuthorizationsController extends Controller{
    async index(ctx){
        let body = ctx.request.body;
        let token = body.token;
        let userInfo;
        let localUserInfo = body.local_user_info;
        let identify = '';
        let name = '';
        if(!token || token.length == 0){
            ctx.status = 400;
            return ctx.body = ({'error':'bad_request', 'error_description': 'Missing some parameters.'});
        }
        try{
            userInfo = helper.decryptUserInfo(token);
            userInfo = JSON.parse(userInfo);
            for(let key in userInfo){
                if(userInfo[key] == undefined || userInfo[key].length == 0){
                    ctx.status = 400;
                    return ctx.body = ({'error':'bad_request', 'error_description': 'User info missing.'});
                }
            }
            let user = await ctx.service.userInfo.getUser(userInfo, identify, name, localUserInfo);
            if(user === false){
                ctx.status = 500;
                return ctx.body = ({'error':'internal_error', 'error_description': 'Internal server error.'});
            }
            let userToken = {
                id: user.id
            }
            const accessToken = this.app.jwt.sign(userToken, this.app.jwt.secret)  //token签名
            return ctx.body = {'code': 200, 'data': {'access_token': accessToken , 'birthday': helper.getBirthray(encrypt.decrypt(user.identify)), 'age': helper.getAge(encrypt.decrypt(user.identify)), 'accountType': user.account_type}};
        }catch(error){
            ctx.status = 400;
            return ctx.body = {'error':'bad_request', 'error_description': 'Parse token error.'};
        }
    }
}

module.exports = AuthorizationsController;