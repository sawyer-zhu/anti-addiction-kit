const Controller = require('egg').Controller;

const helper = require('../../extend/help');

class FcmController extends Controller{

    async setPlayLog(ctx){
        let info = ctx.userInfo;
        let body = ctx.request.body;
        let playLogs = body.play_logs;
        let duration = 0;
        let lastTimestamp = 0;
        let durationResult;
        let day;
        let result;
        let switchs;
        let antiAddictionKit = this.app.mysql.get('anti_addiction_kit_server');
        switchs = await antiAddictionKit.get('switchs', {id: 1});//获取所有开关
        playLogs = JSON.parse(playLogs);
        if(switchs.use_time_switch == 0){
            playLogs = playLogs.local_times;
        }else{
            playLogs = playLogs.server_times;
        }

        if(playLogs != undefined && playLogs.length != 0){
            for(let playLog of playLogs){
                playLog[0] = ~~(playLog[0]);
                playLog[1] = ~~(playLog[1]);
                if(playLog[0] > playLog[1]){//开始时间比结束大 忽略
                    continue;
                }

                if(playLog[0] < helper.getDayStartTime() || playLog[0] > helper.getDayEndTime()){//不是今天的时间戳 忽略
                    continue;
                }
                if(playLog[1] < helper.getDayStartTime() || playLog[1] > helper.getDayEndTime()){//不是今天的时间戳 忽略
                    continue;
                }
                duration += playLog[1] - playLog[0];
                if(playLog[1] > lastTimestamp){
                    lastTimestamp = playLog[1];
                }
            }
        }
        if(info.isIdentification == 0){
            day = 0;
        }else{
            day = helper.getToady();
        }
        if(duration > 0){
            await this.ctx.service.userPlayDuration.updateDuration(duration, info.durationKey, day, lastTimestamp);
        }
        durationResult = await this.ctx.service.userPlayDuration.getDuration(switchs.share_duration_switch, day, info.durationKey);
        result = await this.ctx.service.userPlayDuration.checkRule(switchs, durationResult, info.age, info.isIdentification);
        return ctx.body = (result);
    }

    async getServerTime() {
        const { ctx } = this;
        return ctx.body = {'timestamp': helper.getNow()};
    }
    async getConfig(){
        const { ctx } = this;
        let antiAddictionKit = this.app.mysql.get('anti_addiction_kit_server');
        let switchs = await antiAddictionKit.get('switchs', {id: 1});
        let retuenData = {
            'version' : switchs.version,
            'config' :{
                'nightStrictStart' :switchs.night_ban_time_start,
                'nightStrictEnd' : switchs.night_ban_time_end,
                'childCommonTime' : switchs.shiming_user_duration,
                'childHolidayTime' : switchs.shiming_user_holiday_duration,
            }
        }
        return ctx.body = {'code' : 200 , 'data' : retuenData};
    }

    async realUserInfo(ctx){
        let body = ctx.request.body;
        let name = body.name;
        let identify = body.identify;
        let user = ctx.user;
        if(user.is_identification == 1){
            ctx.status = 400;
            return ctx.body = {'error':'bad_credentials', 'error_description': 'user is identification.'};
        }
        if(name && identify){
            if(await this.ctx.service.userInfo.setIdentify(user.id, identify, name)){
                return ctx.body = { code:200, data: { age : helper.getAge(identify)}} ;
            }else{
                ctx.status = 400;
                return ctx.body = {'error':'bad_credentials', 'error_description': 'identify failed.'};
            }
        }
    }

    async checkPay(ctx){
        let user = ctx.user;
        let amount = ctx.request.body.amount;
        let check_result = await this.ctx.service.identifyChargeAmount.checkPay(user.identify, amount)
        if( check_result !== true){
            return ctx.body = {'code': 200, check: 0, title: check_result.title, description: check_result.description}
        }
        return ctx.body = {'code': 200, check: 1}
    }

    async submitPay(ctx){
        let user = ctx.user;
        let amount = ctx.request.body.amount;
        let check_result = await this.ctx.service.identifyChargeAmount.updateAmount(user.identify, amount)
        if( check_result !== true){
            return ctx.body = {'code': 200, result: 0}
        }
        return ctx.body = {'code': 200, result: 1}
    }

}

module.exports = FcmController;