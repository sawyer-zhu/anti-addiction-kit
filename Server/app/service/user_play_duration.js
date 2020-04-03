const Service = require('egg').Service;
const helper = require('../extend/help');

class UserPlayDurationService extends Service{
    async updateDuration(duration, durationKey, day, lastTimestamp) {
        let antiAddictionKit = this.app.mysql.get('anti_addiction_kit_server');
        await antiAddictionKit.beginTransactionScope(async conn => {
            const results = await conn.query('update user_play_durations set duration = duration + ? , last_timestamp = ? where duration_key = ? and day = ? ', [duration, lastTimestamp, durationKey, day]);
            if(results.affectedRows === 0){
                await conn.insert('user_play_durations', {day: day, duration_key: durationKey, duration: duration, last_timestamp: lastTimestamp});
            }
        }, this.ctx);
    }
    async getDuration(day , durationKey){
        let antiAddictionKit = this.app.mysql.get('anti_addiction_kit_server');
        let durationResult;
        durationResult = await antiAddictionKit.get('user_play_durations', {day: day, duration_key: durationKey})
        if(durationResult == null){
            durationResult = 0;
        }else{
            durationResult = durationResult.duration;
        }

        return durationResult;
    }
    async checkRule(switchs, duration, age, isIdentification){
        let defaultHolidayJson;
        let clientReturnInterval = {'first': 20*60, 'last': 6*60};
        let restrictType = 0;
        let remainTime = 9999;
        let description = '';
        let title = '健康游戏提示';
        let isNightStrict = false;
        if(isIdentification == 0){//未实名
            if(duration >= switchs.no_shiming_user_duration){//没有时长
                restrictType = 2;
                remainTime = 0;
                description = '您的游戏体验时长已达#' + Math.ceil(switchs.no_shiming_user_duration/ 60) + '分钟#。登记实名信息后可深度体验。';
            }else{
                remainTime = switchs.no_shiming_user_duration - duration;
                if(remainTime > clientReturnInterval.last && remainTime <= clientReturnInterval.first){
                    restrictType = 2;
                    description = '您的游戏体验时间还剩余#' + Math.ceil(remainTime/ 60) + '分钟#，登记实名信息后可深度体验。';
                }else if (remainTime <= clientReturnInterval.last){
                    restrictType = 2;
                    description = '您的游戏体验时长已达#' + Math.ceil(switchs.no_shiming_user_duration/ 60) + '分钟#。登记实名信息后可深度体验。'
                }else{
                    restrictType = 0;
                }

            }
        }else{
            if(age < 18){
                defaultHolidayJson = switchs.holiday_dates;
                if(defaultHolidayJson != undefined && defaultHolidayJson.length != 0){
                    let month = helper.getMonth();
                    let day = helper.getDay();
                    try{
                        let holidayJson = JSON.parse(defaultHolidayJson);
                        if(holidayJson[month] != undefined && holidayJson[month].length != 0){
                            if(holidayJson[month][day] != undefined && holidayJson[month][day].length != 0){
                                switchs.shiming_user_duration = switchs.shiming_user_holiday_duration;
                            }
                        }
                    }catch(error){
                        this.ctx.logger.error(error.message);
                    }
                }
                if(helper.getTimeStamp(switchs.night_ban_time_start) > helper.getTimeStamp(switchs.night_ban_time_end)){
                    if(helper.getNow() >= helper.getTimeStamp(switchs.night_ban_time_start) || helper.getNow() <= helper.getTimeStamp(switchs.night_ban_time_end) ){//在宵禁时间内
                        isNightStrict = true;
                    }
                }else{
                    if(helper.getNow() >= helper.getTimeStamp(switchs.night_ban_time_start) && helper.getNow() <= helper.getTimeStamp(switchs.night_ban_time_end) ){//在宵禁时间内
                        isNightStrict = true;
                    }
                }
                if(!isNightStrict){
                    if(duration >= switchs.shiming_user_duration){
                        restrictType = 2;
                        remainTime = 0;
                        description = '您今日游戏时间已达#' + Math.ceil(switchs.shiming_user_duration/ 60) + '分钟#。根据国家相关规定，今日无法再进行游戏。请注意适当休息。'
                    }else{
                        let remain_ngiht_start;
                        remainTime = switchs.shiming_user_duration - duration;//剩余时长
                        if(helper.getTimeStamp(switchs.night_ban_time_start) < helper.getTimeStamp(switchs.night_ban_time_end)){
                            remain_ngiht_start = (helper.getTimeStamp('23:59') - helper.getNow()) + (helper.getTimeStamp(switchs.night_ban_time_start) - helper.getTimeStamp('00:00'));//距宵禁时长
                        }else{
                            remain_ngiht_start = helper.getTimeStamp(switchs.night_ban_time_start) - helper.getNow();//距宵禁时长
                        }

                        if(remain_ngiht_start > remainTime){//距离宵禁时间大于剩余时长 返回剩余时长限制
                            restrictType = 2;
                            if(remainTime > clientReturnInterval.last && remainTime <= clientReturnInterval.first){
                                description = '您今日游戏时间还剩余#' + Math.ceil(remainTime/ 60) +'分钟#，请注意适当休息。';
                            }else if (remainTime <= clientReturnInterval.last){
                                description = '您今日游戏时间已达#' + Math.ceil(switchs.shiming_user_duration/ 60) + '分钟#。根据国家相关规定，今日无法再进行游戏。请注意适当休息。';
                            }else{
                                restrictType = 0;
                            }
                        }else{
                            restrictType = 1;
                            if(remain_ngiht_start > clientReturnInterval.last && remain_ngiht_start <= clientReturnInterval.first){
                                description = '距离健康保护时间还剩余#' + Math.ceil(remain_ngiht_start/ 60) + '分钟#，请注意适当休息。';
                            }else if(remain_ngiht_start <= clientReturnInterval.last){
                                description = '每日 22 点 - 次日 8 点为健康保护时段，当前无法进入游戏。';
                            }else{
                                restrictType = 0;
                            }
                            remainTime = remain_ngiht_start;
                        }
                    }
                }else{
                    remainTime = 0;
                    restrictType = 1;
                    description = '根据国家相关规定，每日 22 点 - 次日 8 点为健康保护时段，当前无法进入游戏。';
                }
            }
        }
        return {'code': 200, 'description': description, 'remainTime': remainTime, 'restrictType': restrictType, 'title': title};
    }
}

module.exports = UserPlayDurationService;