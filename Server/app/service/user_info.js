const Service = require('egg').Service;
const encrypt = require('../extend/encrypt');
const helper = require('../extend/help');

/**
 * 用户信息相关
 */
class UserInfoService extends Service{
    /**
     * 获取用户
     * @param userInfo
     * @param localUserInfo
     * @param accountType
     * @returns {Promise.<*>}
     */
    async getUser(userInfo, localUserInfo, accountType) {
        let identifyState = 0;
        let identify = '';
        let name = '';
        if(accountType == 0){
            if(localUserInfo != undefined && localUserInfo.length != 0 ){
                localUserInfo = JSON.parse(localUserInfo);
                for (let key in localUserInfo){
                    let localUser = localUserInfo[key];
                    if(localUser.userId === userInfo.userId){
                        if(localUser.identify.length != 0 && localUser.name.length != 0){
                            if(helper.validRealid(localUser.identify) && helper.validRealname(localUser.name)){
                                identify = encrypt.encrypt(localUser.identify);
                                name = encrypt.encrypt(localUser.name);
                                identifyState = 1;
                                accountType = 0;
                                break;
                            }
                        }else{
                            accountType = localUser.accountType;
                            if(localUser.accountType > 0){
                                identifyState = 2;
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
            //未实名或者第三方实名才更新状态
            if(user.identify_state != 1){
                const row = {
                    id: user.id,
                    identify,
                    name: '',
                    identify_state: identifyState,
                    account_type: accountType
                }
                const results = await antiAddictionKit.update('user_info', row);
                if(results.affectedRows === 0){
                    return false;
                }
            }
            userId = user.id;
        }
        return this._getUser(userId);
    }

    /**
     * 实名
     * @param userId
     * @param identify
     * @param name
     * @param accountType
     * @returns {Promise.<*>}
     */
    async setIdentify(userId, identify, name, accountType){
        let identifyState;
        if(identify.length != 0 && name.length != 0){
            identify = encrypt.encrypt(identify);
            name = encrypt.encrypt(name);
            identifyState = 1;
            accountType = 0;
        }
        if(accountType > 0){
            identifyState = 2;
            identify = '';
            name = '';
        }
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
            return this._getUser(userId);
        }
        return false;
    }

    /**
     * @param userId
     * @returns {Promise.<*>}
     * @private
     */
    async _getUser(userId){
        let antiAddictionKit = this.app.mysql.get('anti_addiction_kit_server');
        let user = await antiAddictionKit.get('user_info', {id: userId});
        if(user.identify_state == 1){
            let age = helper.getAge(encrypt.decrypt(user.identify));
            if(age < 8 ){
                user.account_type = 1;
            }else if(age >= 8 && age < 16){
                user.account_type = 2;
            }else if(age >= 16 && age < 18){
                user.account_type = 3;
            }else if (age >= 18){
                user.account_type = 4;
            }
        }
        return user;
    }
}

module.exports = UserInfoService;