const Service = require('egg').Service;
const encrypt = require('../extend/encrypt');

class UserInfoService extends Service{
    async getUser(userInfo, identify = '', name = '', is_identification = 0) {
        let user;
        let userId;
        let antiAddictionKit = this.app.mysql.get('anti_addiction_kit_server');
        identify = encrypt.encrypt(identify);
        name = encrypt.encrypt(name);
        user = await antiAddictionKit.get('user_info', {user_id: userInfo.userId});
        if(user == null){
            const results = await antiAddictionKit.insert('user_info', {user_id: userInfo.userId, identify, name, is_identification});
            if(results.affectedRows === 0){
                return false;
            }
            userId = results.insertId;
        }else{
            userId = user.id;
        }
        return await antiAddictionKit.get('user_info', {id: userId});
    }
    async setIdentify(userId, identify, name){
        identify = encrypt.encrypt(identify);
        name = encrypt.encrypt(name);
        let antiAddictionKit = this.app.mysql.get('anti_addiction_kit_server');
        let result;
        const row = {
            id : userId,
            identify,
            name,
            is_identification: 1
        };
        result = await antiAddictionKit.update('user_info', row);
        if(result.affectedRows > 0){
            return true;
        }
        return false;
    }
}

module.exports = UserInfoService;