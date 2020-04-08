const Service = require('egg').Service;
const encrypt = require('../extend/encrypt');

class UserInfoService extends Service{
    async getUser(userInfo, identify = '', name = '', localUserInfo, accountType) {
        let identifyState = 0;
        if(accountType == 0){
            if(localUserInfo != undefined && localUserInfo.length != 0 ){
                localUserInfo = JSON.parse(localUserInfo);
                for (let key in localUserInfo){
                    let localUser = localUserInfo[key];
                    accountType = localUserInfo[key].accountType;
                    if(localUser.userId === userInfo.userId){
                        if(localUser.accountType > 0){
                            identifyState = 2;
                        }else{
                            if(localUser.identify && localUser.name){
                                identify = encrypt.encrypt(localUser.identify);
                                name = encrypt.encrypt(localUser.name);
                                identifyState = 1;
                                break;
                            }
                        }
                    }
                }
            }
        }else{
            identifyState = 2;
        }
        let user;
        let userId;
        let antiAddictionKit = this.app.mysql.get('anti_addiction_kit_server');
        user = await antiAddictionKit.get('user_info', {user_id: userInfo.userId});
        if(user == null){
            const results = await antiAddictionKit.insert('user_info', {user_id: userInfo.userId, identify, name, identify_state:identifyState, account_type:accountType});
            if(results.affectedRows === 0){
                return false;
            }
            userId = results.insertId;
        }else{
            const row = {
                id: user.id,
                identify,
                name,
                identify_state: identifyState,
                account_type: accountType
            }
            const results = await antiAddictionKit.update('user_info', row);
            if(results.affectedRows === 0){
                return false;
            }
            userId = user.id;
        }
        return await antiAddictionKit.get('user_info', {id: userId});
    }
    async setIdentify(userId, identify, name, accountType){
        let identifyState = 1;
        if(accountType > 0){
            identifyState = 2;
            identify = '';
            name = '';
        }
        identify = encrypt.encrypt(identify);
        name = encrypt.encrypt(name);
        let antiAddictionKit = this.app.mysql.get('anti_addiction_kit_server');
        let result;
        const row = {
            id : userId,
            identify,
            name,
            identify_state: identifyState,
            account_type: accountType
        };
        result = await antiAddictionKit.update('user_info', row);
        if(result.affectedRows > 0){
            return true;
        }
        return false;
    }
}

module.exports = UserInfoService;