const fs = require('fs');
const path = require('path');
const NodeRSA = require('node-rsa');
const moment = require('moment');

function now() {
    return ~~(Date.now() / 1000);
}
/**
 * 解密用户token
 * 仅为示例，可自行实现
 * @param data
 * @returns {Buffer|Object|string}
 */
function decrypt_user_info(data){
    let keyPath = path.join(__dirname, '../../config/key/private.pem');
    let keyFile = fs.readFileSync(keyPath);
    let key = new NodeRSA(keyFile);
    return key.decrypt(data, 'utf8');

}
/**
 * 生成用户信息token
 * 仅为示例，可自行实现
 * @param data
 * @returns {string|Buffer}
 */
function encrypt_user_info(data) {
    let keyPath = path.join(__dirname, '../../config/key/public.pem');
    let keyFile = fs.readFileSync(keyPath);
    let key = new NodeRSA(keyFile);
    let encrypted = key.encrypt(data, 'base64');
    return encrypted;
}

function get_age(identityCard) {
    var len = (identityCard + "").length;
    if (len == 0) {
        return 0;
    } else {
        if ((len != 15) && (len != 18))//身份证号码只能为15位或18位其它不合法
        {
            return 0;
        }
    }
    var strBirthday = "";
    if (len == 18)//处理18位的身份证号码从号码中得到生日和性别代码
    {
        strBirthday = identityCard.substr(6, 4) + "-" + identityCard.substr(10, 2) + "-" + identityCard.substr(12, 2);
    }
    if (len == 15) {
        strBirthday = "19" + identityCard.substr(6, 2) + "-" + identityCard.substr(8, 2) + "-" + identityCard.substr(10, 2);
    }

    var birthDate = new Date(strBirthday);
    var nowDateTime = new Date();
    var age = nowDateTime.getFullYear() - birthDate.getFullYear();
    //再考虑月、天的因素;.getMonth()获取的是从0开始的，这里进行比较，不需要加1
    if (nowDateTime.getMonth() < birthDate.getMonth() || (nowDateTime.getMonth() == birthDate.getMonth() && nowDateTime.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
function get_birthday(identityCard) {
    var len = (identityCard + "").length;
    if (len == 0) {
        return 0;
    } else {
        if ((len != 15) && (len != 18))//身份证号码只能为15位或18位其它不合法
        {
            return 0;
        }
    }
    var strBirthday = "";
    if (len == 18)//处理18位的身份证号码从号码中得到生日和性别代码
    {
        strBirthday = identityCard.substr(6, 4) + "-" + identityCard.substr(10, 2) + "-" + identityCard.substr(12, 2);
    }
    if (len == 15) {
        strBirthday = "19" + identityCard.substr(6, 2) + "-" + identityCard.substr(8, 2) + "-" + identityCard.substr(10, 2);
    }
    return strBirthday
}

function get_time_stamp(time_str){
    return ~~(new Date(moment().format("YYYY-MM-DD "+ time_str)).getTime()/ 1000)
}

function get_month(){
    return moment().format("YYYYMM");
}

function get_day(){
    return moment().format("DD");
}

function get_today() {
    return moment().format("YYYYMMDD")
}

function get_day_start_time() {
    const nowTimeDate = new Date()
    return ~~(nowTimeDate.setHours(0, 0, 0, 0) /1000);
}

function get_day_end_time() {
    const nowTimeDate = new Date()
    return ~~(nowTimeDate.setHours(23, 59, 59, 999) /1000);
}

module.exports = {
    getNow : now,
    getAge : get_age,
    getBirthray: get_birthday,
    decryptUserInfo: decrypt_user_info,
    getTimeStamp: get_time_stamp,
    getMonth : get_month,
    getDay : get_day,
    getToady: get_today,
    getDayStartTime : get_day_start_time,
    getDayEndTime : get_day_end_time,
    encryptUserInfo : encrypt_user_info
}