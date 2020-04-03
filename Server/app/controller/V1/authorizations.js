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
        let is_identification;
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
            if(localUserInfo != undefined && localUserInfo.length != 0 ){
                localUserInfo = JSON.parse(localUserInfo);
                for (let key in localUserInfo){
                    let localUser = localUserInfo[key];
                    if(localUser.userId == userInfo.user_id){
                        if(localUser.identify && localUser.name){
                            identify = localUser.identify;
                            name = localUser.name;
                            is_identification = 1;
                            break;
                        }
                    }
                }
            }
            let user = await ctx.service.userInfo.getUser(userInfo, identify, name, is_identification);
            if(user === false){
                ctx.status = 500;
                return ctx.body = ({'error':'internal_error', 'error_description': 'Internal server error.'});
            }
            let userToken = {
                id: user.id
            }
            const accessToken = this.app.jwt.sign(userToken, this.app.jwt.secret, {expiresIn: '1'})  //token签名 有效期为1小时
            return ctx.body = {'code': 200, 'data': {'access_token': accessToken , 'birthday': helper.getBirthray(encrypt.decrypt(user.identify)), 'age': helper.getAge(encrypt.decrypt(user.identify))}};
        }catch(error){
            console.log(error)
            ctx.status = 400;
            return ctx.body = {'error':'bad_request', 'error_description': 'Parse token error.'};
        }
    }
}

module.exports = AuthorizationsController;