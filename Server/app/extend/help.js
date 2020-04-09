const fs = require('fs');
const path = require('path');
const NodeRSA = require('node-rsa');
const moment = require('moment');

function getNow() {
    return ~~(Date.now() / 1000);
}
/**
 * 解密用户token
 * 仅为示例，可自行实现
 * @param data
 * @returns {Buffer|Object|string}
 */
function decryptUserInfo(data){
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
function encryptUserInfo(data) {
    let keyPath = path.join(__dirname, '../../config/key/public.pem');
    let keyFile = fs.readFileSync(keyPath);
    let key = new NodeRSA(keyFile);
    let encrypted = key.encrypt(data, 'base64');
    return encrypted;
}

function getAge(identityCard) {
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
function getBirthday(identityCard) {
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

function getTimeStamp(time_str){
    return ~~(new Date(moment().format("YYYY-MM-DD "+ time_str)).getTime()/ 1000)
}

function getMonth(){
    return moment().format("YYYYMM");
}

function getDay(){
    return moment().format("DD");
}

function getToday() {
    return moment().format("YYYYMMDD")
}

function getDayStartTime() {
    const nowTimeDate = new Date()
    return ~~(nowTimeDate.setHours(0, 0, 0, 0) /1000);
}

function getDayEndTime() {
    const nowTimeDate = new Date()
    return ~~(nowTimeDate.setHours(23, 59, 59, 999) /1000);
}
function validRealname(str) {
    let reg = /^[\u3300-\u9fff\uf900-\ufaff]{1,}(•|·)?([\u3300-\u9fff\uf900-\ufaff]{1,}(•|·)){0,}[\u3300-\u9fff\uf900-\ufaff]{1,}$/;
    if (!reg.test(str)) {
        return false;
    }
    return true;
}

function validRealid(idcard) {
    if (typeof idcard == 'string') {
        idcard = idcard.toUpperCase();
    }
    let area = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙古",
        21: "辽宁",
        22: "吉林",
        23: "黑龙江",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
        91: "国外"
    }
    let Y, JYM;
    let S, M;
    let idcardArray;
    idcardArray = idcard.split("");
    let ereg;
    if (area[parseInt(idcard.substr(0, 2))] == null) return false;
    switch (idcard.length) {
        case 18:
            if (parseInt(idcard.substr(6, 4)) % 4 == 0 || (parseInt(idcard.substr(6, 4)) % 100 == 0 && parseInt(idcard.substr(6, 4)) % 4 == 0)) {
                ereg = /^[0-9]{6}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9X]$/;
            } else {
                ereg = /^[0-9]{6}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9X]$/;
            }
            if (ereg.test(idcard)) {
                S = (parseInt(idcardArray[0]) + parseInt(idcardArray[10])) * 7 + (parseInt(idcardArray[1]) + parseInt(idcardArray[11])) * 9 + (parseInt(idcardArray[2]) + parseInt(idcardArray[12])) * 10 + (parseInt(idcardArray[3]) + parseInt(idcardArray[13])) * 5 + (parseInt(idcardArray[4]) + parseInt(idcardArray[14])) * 8 + (parseInt(idcardArray[5]) + parseInt(idcardArray[15])) * 4 + (parseInt(idcardArray[6]) + parseInt(idcardArray[16])) * 2 + parseInt(idcardArray[7]) * 1 + parseInt(idcardArray[8]) * 6 + parseInt(idcardArray[9]) * 3;
                Y = S % 11;
                M = "F";
                JYM = "10X98765432";
                M = JYM.substr(Y, 1);
                if (M == idcardArray[17]) return true;
                else
                    return false;
            } else
                return false;
            break;
        default:
            return false;
            break;
    }
}

module.exports = {
    getNow,
    getAge,
    getBirthday,
    decryptUserInfo,
    getTimeStamp,
    getMonth,
    getDay,
    getToday,
    getDayStartTime,
    getDayEndTime,
    encryptUserInfo,
    validRealid,
    validRealname
}