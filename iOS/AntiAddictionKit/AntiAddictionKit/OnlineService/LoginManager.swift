
import Foundation

struct LoginManager {
    
    /// 游戏主动登录用户
    static func login(user id: String, type: Int) {
        LoginManager.logout()
        
        let account = Account(id: id, type: AccountType.type(rawValue: type))
        
        var localUserInfo: [String: Any]? = nil
        
        // 如果本地有数据，则上传给服务器后删除
        if let storedUser = UserService.fetch(account.id) {
            localUserInfo = ["name": storedUser.realName?.decrypt() ?? "",
                             "identify": storedUser.idCardNumber?.decrypt() ?? "",
                             "phone": storedUser.phone?.decrypt() ?? "",
                             "accountType": storedUser.type.rawValue]
            account.type = AccountType.type(rawValue: storedUser.type.rawValue)
            UserService.delete(account.id) // 获取后删掉本地数据
            Logger.debug("有本地记录，取值后删掉本地数据")
        }
        
        
        // 以 id 换服务端 `token`
        Networking.authorize(token: account.id, accountType: type, localUserInfo: localUserInfo) { (accessToken, accountType) in
            account.token = accessToken
            account.type = AccountType.type(rawValue: accountType)
        }
        
        // 设置当前已登录用户
        AccountManager.currentAccount = account
        
        // 有 token 则进获取时间限制，保证最终发送`登录成功`回调
        if let token = account.token {
            //  拿到 token 后获取防沉迷限制
            let ts: Int = Int(Date().timeIntervalSince1970)
            
            Networking.setPlayLog(token: token,
                                  serverTime: (ts, ts),
                                  localTime: (ts, ts),
                                  successHandler: { (restrictType, remainTime, title, description) in
                
                                    if remainTime >= 0 {
                                        TimeManager.currentRemainTime = remainTime
                                    }
                                    
                                    //成年人 无限制
                                    if account.type == .adult {
                                        AntiAddictionKit.sendCallback(result: .loginSuccess, message: "用户登录成功")
                                        return
                                    }
                                    
                                    // 未成年人
                                    if (account.type) == .child || (account.type == .junior) || (account.type == .senior) {
                                        //宵禁
                                        if restrictType == 1 {
                                            if remainTime > 0 {
                                                //登录成功，开始定期计时
                                                AntiAddictionKit.sendCallback(result: .loginSuccess, message: "用户登录成功")
                                                
                                                TimeManager.activate(isLogin: true)
                                                return
                                            } else {
                                                //宵禁弹窗
                                                Router.openAlertController(AlertData(type: .timeLimitAlert,
                                                                                     title: title,
                                                                                     body: Notice.nightStrictLimit.content,
                                                                                     remainTime: remainTime))
                                                return
                                            }
                                            
                                        } else {
                                            //非宵禁 一般时长限制
                                            if remainTime > 0 {
                                                AntiAddictionKit.sendCallback(result: .loginSuccess, message: "用户登录成功")
                                                
                                                TimeManager.activate(isLogin: true)
                                                return
                                            } else {
                                                // 无剩余时长的 弹窗提醒
                                                Router.openAlertController(AlertData(type: .timeLimitAlert,
                                                                                     title: title,
                                                                                     body: Notice.childLimit(isHoliday: DateHelper.isHoliday(Date())).content,
                                                                                     remainTime: remainTime))
                                                return
                                            }
                                        }
                                    }
                                    
                                    // 游客 未实名
                                    if account.type == .unknown {
                                        var guestLoginNotice: String
                                        if remainTime == AntiAddictionKit.configuration.guestTotalTime {
                                            guestLoginNotice = Notice.guestFirstLogin.content
                                        } else if remainTime > 0 {
                                            guestLoginNotice = Notice.guestRemain(remainTime: remainTime).content
                                        } else {
                                            guestLoginNotice = Notice.guestLimit.content
                                        }
                                        // 游客登录时统一弹窗
                                        Router.openAlertController(AlertData(type: .timeLimitAlert,
                                                                             title: title,
                                                                             body: guestLoginNotice,
                                                                             remainTime: remainTime))
                                        return
                                    }
                                    
                                    //默认直接登录成功
                                    AntiAddictionKit.sendCallback(result: .loginSuccess, message: "用户登录成功")
                                    TimeManager.activate(isLogin: true)
                                    return
                                    
            }) {
                //获取账号的防沉迷限制失败
                AntiAddictionKit.sendCallback(result: .loginSuccess, message: "用户登录成功")
                Logger.release("获取用户防沉迷数据失败")
                return
            }
            
        }
        else {
            //如果拿不到token，则用户类型type设置为成年人
            account.type = .adult
            AccountManager.currentAccount = account
            AntiAddictionKit.sendCallback(result: .loginSuccess, message: "用户登录成功")
            
            Logger.release("获取服务器 Token 失败，防沉迷功能关闭！")
            return
        }
        
    }
    
    
    
    /// 游戏主动退出用户
    static func logout() {
        // -----单机版----- begin
        //停止计时器相关（同时会保存当前用户信息）
        TimeService.stop()

        //关掉所有页面
        Router.closeContainer()
        Router.closeAlertTip()

        // 清除当前用户信息
        User.shared = nil

        // 清除用户主动点击关闭浮窗后记录的浮窗显示逻辑
        AlertTip.userTappedToDismiss = false
        // -----单机----- end
        
        
        // -----网络版----- begin
        TimeManager.inactivate()
        AccountManager.currentAccount = nil
        // -----网络版----- end
    }
    
    
    
    
}
