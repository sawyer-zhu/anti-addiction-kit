
import Foundation

// 网络版 付费管理
struct PaymentManager {
    
    static func check(amount: Int) {
        
        //如果未开启 付费限制，直接发送无限制回调
        if AntiAddictionKit.configuration.useSdkPaymentLimit == false {
            AntiAddictionKit.sendCallback(result: .noPayLimit, message: "无支付限制")
            return
        }
        
        if let account = AccountManager.currentAccount, let token = account.token {
            Networking.checkPayment(token: token, amount: amount) { (allow, title, description) in
                if allow {
                    AntiAddictionKit.sendCallback(result: .noPayLimit, message: "无支付限制")
                    return
                } else {
                    if account.type == AccountType.unknown {
                        Router.openRealNameController(backButtonEnabled: false, forceOpen: true, cancelled: {
                            //用户取消实名登记
                            AntiAddictionKit.sendCallback(result: .hasPayLimit, message: "用户取消实名登记，无法支付")
                        }) {
                            //用户实名登记成功，重新查询支付限制
                            self.check(amount: amount)
                        }
                        
                    } else {
                        let alertData = AlertData(type: .payLimitAlert, title: title, body: description)
                        Router.openAlertController(alertData)
                    }
                }
            }
        } else {
            AntiAddictionKit.sendCallback(result: .noPayLimit, message: "无支付限制")
        }
        
    }
    
    static func submit(amount: Int) {
        if let account = AccountManager.currentAccount, let token = account.token {
            Networking.setPayment(token: token, amount: amount)
        }
        Logger.debug("无token，无法提交付费金额。")
    }
    
}
