'use strict';

const Controller = require('egg').Controller;
const helper = require('../extend/help');
/**
 * 测试后台，仅测试时使用
 */
class DashboardController extends Controller {
    async index() {
        let title = "dashboard";
        await this.ctx.render('dashboard',{
            title: '修改游戏时长'
        });
    }
    async editRemainDuration(ctx){
        let body = ctx.request.body;
        let userId = body.user_id;
        let remainDuration = body.remain_duration;
        let userInfo;
        let day;
        let switchs;
        let defaultHolidayJson;
        let duration;
        let antiAddictionKit = this.app.mysql.get('anti_addiction_kit_server');
        switchs = await antiAddictionKit.get('switchs', {id: 1});
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
        duration = switchs.shiming_user_duration - remainDuration*60;
        userInfo = await antiAddictionKit.get('user_info', {user_id: userId});
        if(userInfo === null){
            return ctx.body = '用户不存在';
        }
        if(duration < 0){
            return ctx.body = '剩余时长不能超过最大可玩时长';
        }
        if(userInfo !== null && duration > 0){
            day = helper.getToady();
            const results = await antiAddictionKit.query('update user_play_durations set duration = ? where day = ? and duration_key = ?', [duration, day, userInfo.identify]);
            if(results.affectedRows === 0){
                await antiAddictionKit.insert('user_play_durations', {day: day, duration: duration, duration_key: userInfo.identify, last_timestamp: helper.getNow()});
            }
        }
        ctx.body = 'success';
        return ctx.body;
    }

    async createUserToken(ctx){
        let userId = ctx.request.query.user_id;
        let token = helper.encryptUserInfo({userId});
        return ctx.body = {token};
    }
}

module.exports = DashboardController;
