
import Foundation
import CoreTelephony

internal class RegionDetector {
    
    // MARK: - Public
    
    static var isMainlandUser: Bool {
        let key = Key<Bool>(RegionDetector.mainlandUserKey)
        return Defaults.shared.get(for: key) ?? false
    }
    
    /// 是否检测过
    static var isDetected: Bool {
        let key = Key<Bool>(RegionDetector.detectMarkKey)
        return Defaults.shared.get(for: key) ?? false
    }
   
    /// 检测地区
    static func detect() {
        var isMainlandUser: Bool = false
        
        // 将检测结果保存在本地，保证最后执行
        defer {
            let userKey = Key<Bool>(self.mainlandUserKey)
            Defaults.shared.set(isMainlandUser, for: userKey)
            
            let markKey = Key<Bool>(self.detectMarkKey)
            Defaults.shared.set(true, for: markKey)
        }
        
        let carrier: Int = isMainlandCarrier ? 1 : 0
        
        checkRegionFromServer(carrier: carrier, successHandler: { (region) in
            // 服务端拿到的 region
            isMainlandUser = (region == 1)
            return
        }) {
            // 拿不到 region, 通过运营商和设备地区判断，有一个满足条件则判断为大陆用户
            isMainlandUser = (carrier == 1 || self.isMainlandDeviceLocale)
            return
        }
        
    }
    
    // MARK: - Private
    
    private static let detectMarkKey: String = "detectMark"
    private static let mainlandUserKey: String = "isMainlandUser"
    
    /// 是否中国大陆运营商（判断条件 MobileCountryCode == 460/461）
    private static var isMainlandCarrier: Bool {
        
        let telephony = CTTelephonyNetworkInfo()
        
        if #available(iOS 12.0, *) {
            if let carrierDictionary = telephony.serviceSubscriberCellularProviders {
                for (_, carrier) in carrierDictionary {
                    if let mobileCountryCode = carrier.mobileCountryCode, (mobileCountryCode == "460") || (mobileCountryCode == "461") {
                        return true
                    }
                }
            }
        } else {
            if let carrier = telephony.subscriberCellularProvider, let mobileCountryCode = carrier.mobileCountryCode {
                return ((mobileCountryCode == "460") || (mobileCountryCode == "461"))
            }
            
        }
        
        return false
    }
    
    /// 设备地区是否中国大陆（判断条件 regionCode == "CN"）
    private static var isMainlandDeviceLocale: Bool {
        let locale = Locale.current
        if let regionCode = locale.regionCode, regionCode == "CN" {
            return true
        }
        if String(locale.identifier.suffix(2)) == "CN" {
            return true
        }
        return false
    }
    
    /// 判断出口IP是否中国大陆
    private static func checkRegionFromServer(carrier: Int,
                                              successHandler: ((_ region: Int) -> Void)? = nil,
                                              failureHandler: (() -> Void)? = nil) {
        let bundle: String = Bundle.main.bundleIdentifier ?? "antiaddictionkit"
        let urlString = "https://api.xd.com/v3/sdk/check_ip?bundle=\(bundle)&carrier=\(carrier)"
        let r = Just.get(urlString)

        if let data = r.content,
            let httpCode = r.statusCode,
            httpCode == Int(200) {
            do {
                let json = try JSON(data: data)
                if let code = json["code"].int, code == Int(200),
                    let region = json["region"].int {
                    // 拿到数据
                    successHandler?(region)
                    return
                }
            } catch {}
        }
        
        // 未拿到数据
        failureHandler?()
        return
    }
    
}
