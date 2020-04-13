
import Foundation
import UIKit

/// 联网版用户相关服务
struct AccountManager {
    
    /// 当前登录的用户
    static var currentAccount: Account? = nil
    
    /// 获取用户类型
    /// - Returns: 用户类型
    static func getAccountType(id: String) -> AccountType {
        if let a = currentAccount, a.id == id {
            return a.type
        } else {
            return .unknown
        }
    }
    
    
    /// 游戏主动更新用户
    static func updateAccountType(type: Int) {
        
        guard let account = AccountManager.currentAccount, let token = account.token else {
            Logger.debug("当前无登录用户，无法更新用户类型")
            return
        }
        let newAccountType = AccountType.type(rawValue: type)
        account.type = newAccountType
        
        Networking.setUserInfo(token: token,
                               name: "",
                               identify: "",
                               accountType: newAccountType,
                               successHandler: { (updatedAccountType) in
                                //成功
                                account.type = updatedAccountType
        }) {
            //更新用户类型提交失败
        }
        
        
        Router.closeAlertTip()
        Router.closeContainer()

        TimeManager.activate()
        
    }
    
    
    
}

extension AccountManager {

    /// SDK 登出用户
    static func sdkLogout() {
        
    }

    private static func sdkLogin(_ user: User) {

        // 先清除所有弹窗，清除当前用户信息
        sdkLogout()

        // 尝试从硬盘中取出用户
        var isFirstLogin = false
        var theUser: User = user
        if var storedUser = UserService.fetch(theUser.id) {
            Logger.info("本地已找到用户[\(user.id)]")
            isFirstLogin = false
            storedUser.updateUserType(theUser.type)
            theUser = storedUser
        } else {
            Logger.info("本地未找到用户[\(user.id)]，用户第一次登录")
            isFirstLogin = true
        }

        // 更新当前用户
        User.shared = theUser

        // 如果在线时长控制未开启，则直接登录成功
        if !AntiAddictionKit.configuration.useSdkOnlineTimeLimit {
            Logger.info("游戏未开启防沉迷时长统计")
            AntiAddictionKit.sendCallback(result: .loginSuccess, message: "用户登录成功")
            return
        }

        //如果最后一次存储的日期 与 现在不是同一天，则清空 在线时长
        if DateHelper.isSameDay(theUser.timestamp, Date()) == false {
            Logger.info("上一次登录非今天，清空在线时长")
            theUser.clearOnlineTime()
        }

        //如果最后一次存储的日期 与 现在不是同一月，则清空 支付金额
        if DateHelper.isSameMonth(theUser.timestamp, Date()) == false {
            Logger.info("上一次登录非本月，清空付费金额")
            theUser.clearPaymentAmount()
        }

        //用户时长限制类型 游客 未成年人 成年人
        let limitLevel = TimeLimitLevel.limitLevelForUser(user)

        //成年人 直接登录成功
        if limitLevel == .unlimited  {
            Logger.info("成年用户，无需统计时长")
            AntiAddictionKit.sendCallback(result: .loginSuccess, message: "用户登录成功")
            return
        }

        //如果是游客，弹出时间提示，游客不区分节假日
        if limitLevel == .guest {
            let guestTotalTime: Int = AntiAddictionKit.configuration.guestTotalTime
            let remainSeconds: Int = guestTotalTime - theUser.totalOnlineTime

            assert(guestTotalTime >= 0, "游客设定总时长不能为负数！！！")
            assert(remainSeconds >= 0, "用户剩余时间不能为负数！！！")

            var content: AlertType.TimeLimitAlertContent

            if (remainSeconds <= 0) {
                //没有时间
                Logger.info("游客用户，没时间了，弹窗")
                User.shared!.resetOnlineTime(guestTotalTime)
                let minutes = guestTotalTime / kSecondsPerMinute
                content = AlertType.TimeLimitAlertContent.guestGameOver(minutes: minutes)
            } else {
                Logger.info("游客用户，还有时间，弹窗")
                let minutes = Int(ceilf(Float(remainSeconds) / Float(kSecondsPerMinute)))
                content = AlertType.TimeLimitAlertContent.guestLogin(minutes: minutes, isFirstLogin: isFirstLogin)
            }

            Router.openAlertController(AlertData(type: .timeLimitAlert,
                                                 title: content.title,
                                                 body: content.body,
                                                 remainTime: remainSeconds))

            return
        }

        //未成年人
        if limitLevel == .minor {

            //如果是宵禁，无法进入游戏，给游戏发送无游戏时间通知
            if DateHelper.isCurfew(Date()) {
                //宵禁无法进入
                Logger.info("当前为宵禁时间，弹窗")

                AntiAddictionKit.sendCallback(result: .noRemainTime, message: "宵禁时间，无法进入游戏！")

                let content = AlertType.TimeLimitAlertContent.minorGameOver(isCurfew: true)
                Router.openAlertController(AlertData(type: .timeLimitAlert,
                                                     title: content.title,
                                                     body: content.body,
                                                     remainTime: 0))

                return
            }

            //登录时如果没有剩余时长则弹窗
            let isHoliday = DateHelper.isHoliday(Date())
            let minorTotalTime: Int = isHoliday ? AntiAddictionKit.configuration.minorHolidayTotalTime : AntiAddictionKit.configuration.minorCommonDayTotalTime
            let remainSeconds: Int = minorTotalTime - theUser.totalOnlineTime

            assert(minorTotalTime >= 0, "未成年人设定总时长不能为负数！！！")
            assert(remainSeconds >= 0, "用户剩余时间不能为负数！！！")

            if remainSeconds <= 0 {
                Logger.info("未成年用户，没时间了，弹窗")
                let minutes: Int = minorTotalTime / kSecondsPerMinute
                let content = AlertType.TimeLimitAlertContent.minorGameOver(minutes: minutes, isCurfew: false)
                Router.openAlertController(AlertData(type: .timeLimitAlert,
                                                     title: content.title,
                                                     body: content.body,
                                                     remainTime: 0))

                return
            }

            //如果有剩余时间，未成年人登录时不弹窗，直接登录开始计时
            Logger.info("未成年用户，有时间，直接登录开始计时")
            AntiAddictionKit.sendCallback(result: .loginSuccess, message: "用户登录成功")
            TimeService.start()
            return
        }

    }
}
