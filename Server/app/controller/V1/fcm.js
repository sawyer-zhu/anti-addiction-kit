const Controller = require('egg').Controller;
const helper = require('../../extend/help');

class FcmController extends Controller{

    /**
     * 上传游戏时长记录
     * @param ctx
     * @returns {Promise.<Promise|*>}
     */
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
        if(info.identifyState == 0){
            day = 0;
        }else{
            day = helper.getToday();
        }
        if(duration > 0){
            await this.ctx.service.userPlayDuration.updateDuration(duration, info.durationKey, day, lastTimestamp);
        }
        durationResult = await this.ctx.service.userPlayDuration.getDuration(day, info.durationKey);
        result = await this.ctx.service.userPlayDuration.checkRule(switchs, durationResult, info.identifyState);
        return ctx.body = (result);
    }

    /**
     * 获取服务器时间戳
     * @returns {Promise.<{timestamp: *}>}
     */
    async getServerTime() {
        const { ctx } = this;
        return ctx.body = {'timestamp': helper.getNow()};
    }

    /**
     * 获取防沉迷配置
     * @returns {Promise.<{code: number, data: {version: (*|string|string|string), config: {nightStrictStart: *, nightStrictEnd: *, childCommonTime: *, childHolidayTime: *, teenPayLimit: *, teenMonthPayLimit: *, youngPayLimit: *, youngMonthPayLimit: *, description: {unIdentifyRemain: string, unIdentifyFirstLogin: string, unIdentifyLimit: string, identifyLimit: string, identifyRemain: string, nightStrictRemain: string, nightStrictLimit: string}}}}>}
     */
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
                'teenPayLimit' : switchs.teen_pay_limit,
                'teenMonthPayLimit' : switchs.teen_month_pay_limit,
                'youngPayLimit' : switchs.young_pay_limit,
                'youngMonthPayLimit' : switchs.young_month_pay_limit,
                'description': {
                    'unIdentifyRemain' : '您的游戏体验时间还剩余#分钟#，登记实名信息后可深度体验。',
                    'unIdentifyFirstLogin' :'您当前未提交实名信息，根据国家相关规定，享有#分钟#游戏体验时间。登记实名信息后可深度体验。',
                    'unIdentifyLimit' : '您的游戏体验时长已达#分钟#。登记实名信息后可深度体验。',
                    'identifyLimit' : '您今日游戏时间已达#分钟#。根据国家相关规定，今日无法再进行游戏。请注意适当休息。',
                    'identifyRemain' : '您今日游戏时间还剩余#分钟#，请注意适当休息。',
                    'nightStrictRemain' : '距离健康保护时间还剩余#分钟#，请注意适当休息。',
                    'nightStrictLimit' : '根据国家相关规定，每日 22 点 - 次日 8 点为健康保护时段，当前无法进入游戏。'

                }
            }
        }
        return ctx.body = {'code' : 200 , 'data' : retuenData};
    }

    /**
     * 实名
     * @param ctx
     * @returns {Promise.<*>}
     */
    async realUserInfo(ctx){
        let body = ctx.request.body;
        let name = body.name;
        let accountType = body.accountType;
        let identify = body.identify;
        let user = ctx.user;
        if(user.identify_state == 1){
            ctx.status = 400;
            return ctx.body = {'error':'bad_credentials', 'error_description': 'user is identification.'};
        }
        if(accountType == undefined){
            ctx.status = 400;
            return ctx.body = {'error':'bad_request', 'error_description': 'miss paramter.'};
        }
        if(accountType == 0){
            if(name.length == 0 || identify.length == 0){
                ctx.status = 400;
                return ctx.body = {'error':'bad_request', 'error_description': 'miss paramter.'};
            }
            if(!helper.validRealid(identify) || !helper.validRealname(name)){
                ctx.status = 400;
                return ctx.body = {'error':'bad_request', 'error_description': '请填写真实有效证件信息。'};
            }

        }
        user = await this.ctx.service.userInfo.setIdentify(user.id, identify, name, accountType);
        if(user === false){
            ctx.status = 400;
            return ctx.body = {'error':'bad_credentials', 'error_description': 'identify failed.'};
        }
        return ctx.body = { code:200, data: { accountType: user.account_type}} ;
    }

    /**
     * 检查是否能充值
     * amount 单位：分
     * @param ctx
     * @returns {Promise.<*>}
     */
    async checkPay(ctx){
        let user = ctx.user;
        let amount = ctx.request.body.amount;
        let check_result = await this.ctx.service.chargeAmount.checkPay(user, amount)
        if( check_result !== true){
            return ctx.body = {'code': 200, check: 0, title: check_result.title, description: check_result.description}
        }
        return ctx.body = {'code': 200, check: 1}
    }

    /**
     * 提交充值记录
     * amount 单位：分
     * @param ctx
     * @returns {Promise.<{code: number, result: number}>}
     */
    async submitPay(ctx){
        let user = ctx.user;
        let amount = ctx.request.body.amount;
        let check_result = await this.ctx.service.chargeAmount.updateAmount(user, amount)
        if( check_result !== true){
            return ctx.body = {'code': 200, result: 0}
        }
        return ctx.body = {'code': 200, result: 1}
    }

}

module.exports = FcmController;