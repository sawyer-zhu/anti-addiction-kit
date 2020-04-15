
import Foundation

final class PayService {
    
    // MARK: - Public
    
    /// 查询能否购买道具，通过回调通知调用方
    /// - Parameter price: 道具价格
    public class func canPurchase(_ price: Int) {
        
        if AntiAddictionKit.configuration.useSdkPaymentLimit == false {
            let limitType = PayLimitType.unlimited
            limitType.notify()
            return
        }
        PayService.getPayLimitType(price).notify()
    }
    
    /// 成功购买道具
    /// - Parameter price: 道具价格
    public class func didPurchase(_ price: Int) {
        if User.shared == nil { return }
        User.shared!.paymentIncrease(price)
        UserService.store(User.shared!)
    }
}

extension PayService {
    
    // MARK: - Private
    private class func getPayLimitType(_ price: Int) -> PayLimitType {
        guard let user = User.shared else {
            return .unAuthed(price)
        }
        switch user.type {
        case .adult:
            return .unlimited
        case .child:
            return .tooYoung
        case .junior:
            //检测支付金额限制
            if (price > AntiAddictionKit.configuration.singlePaymentAmountLimitJunior) {
                return .singleAmountLimit
            } else if (price + user.totalPaymentAmount) > AntiAddictionKit.configuration.mouthTotalPaymentAmountLimitJunior {
                return .monthTotalAmountLimit
            } else {
                return .unlimited
            }
        case .senior:
             //检测支付金额限制
            if (price > AntiAddictionKit.configuration.singlePaymentAmountLimitSenior) {
                return .singleAmountLimit
            } else if (price + user.totalPaymentAmount) > AntiAddictionKit.configuration.mouthTotalPaymentAmountLimitSenior {
                return .monthTotalAmountLimit
            } else {
                return .unlimited
            }
        case .unknown:
            return .unAuthed(price)
        }
    }
    
}

fileprivate enum PayLimitType {
    // price参数，方便用户实名成功后自动重新检测支付限制
    case unAuthed(_ price: Int) // 未实名
    case tooYoung // 0-8岁不能支付
    case singleAmountLimit //8-16 16-17 单次支付金额限制
    case monthTotalAmountLimit //8-16 16-17 每月支付金额限制
    case unlimited //无限制
    
    func paymentLimitAlertBody() -> String {
        switch self {
        case .unAuthed(_):
            Logger.info("用户没实名登记，无法充值")
            return "根据国家相关规定，当前您无法使用充值相关功能。"
        case .tooYoung:
            Logger.info("用户低于8岁，无法充值")
            return "根据国家相关规定，当前您无法使用充值相关功能。"
        case .singleAmountLimit:
            Logger.info("超过单价限制，无法充值")
            return "根据国家相关规定，您本次付费金额超过规定上限，无法购买。请适度娱乐，理性消费。"
        case .monthTotalAmountLimit:
             Logger.info("超过总额限制，无法充值")
            return "根据国家相关规定，您当月的剩余可用充值额度不足，无法购买此商品。请适度娱乐，理性消费。"
        case .unlimited:
             Logger.info("充值没限制")
            return "请适度娱乐，理性消费。"
        }
    }
    
    func notify() {
        let type: AlertType = .payLimitAlert
        let title: String = kPaymentLimitAlertTitle
        let body = self.paymentLimitAlertBody()
        let alertData = AlertData(type: type, title: title, body: body)
        switch self {
        case .unlimited:
            AntiAddictionKit.sendCallback(result: .noPayLimit, message: "无支付限制")
        case .tooYoung, .singleAmountLimit, .monthTotalAmountLimit:
            Router.openAlertController(alertData)
        case .unAuthed(let price):
            //游客想付费，直接弹出实名登记页面
            if AntiAddictionKit.configuration.useSdkRealName {
                Router.openRealNameController(backButtonEnabled: false, forceOpen: true, cancelled: {
                    //用户取消实名登记
                    AntiAddictionKit.sendCallback(result: .hasPayLimit, message: "用户取消实名登记，无法支付")
                }) {
                    //用户实名登记成功，重新查询支付限制
                    PayService.canPurchase(price)
                    
                }
            } else {
                AntiAddictionKit.sendCallback(result: .realNameRequest, message: "用户支付，请求实名")
            }
        }
    }
}


