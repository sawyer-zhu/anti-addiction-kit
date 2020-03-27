
import Foundation
import CoreTelephony

class RegionDetector {
    
    // MARK: - Public
    
    public static var isMainlandUser: Bool {
        let key = Key<Bool>(RegionDetector.mainlandUserKey)
        return Defaults.shared.get(for: key) ?? false
    }
    
    /// 是否检测过
    public static var isDetected: Bool {
        let key = Key<Bool>(RegionDetector.detectMarkKey)
        return Defaults.shared.get(for: key) ?? false
    }
   
    /// 检测地区
    public static func detect() {
        var isMainlandUser: Bool = false
        
        // 检测结果保存在本地，保证最后执行
        defer {
            let userKey = Key<Bool>(self.mainlandUserKey)
            Defaults.shared.set(isMainlandUser, for: userKey)
            
            let markKey = Key<Bool>(self.detectMarkKey)
            Defaults.shared.set(true, for: markKey)
        }
        
        if isMainlandCarrier() {
            isMainlandUser = true
        } else {
            if isMainlandIPAddress() {
                isMainlandUser = true
            } else {
                if isMainlandLocale() {
                    isMainlandUser = true
                }
            }
        }
        
    }
    
    // MARK: - Private
    
    private static let detectMarkKey: String = "detectMark"
    private static let mainlandUserKey: String = "isMainlandUser"
    
    /// 判断是否中国大陆运营商（判断条件 MobileCountryCode == 460/461）
    private static func isMainlandCarrier() -> Bool {
        
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
    
    /// 判断地区是否中国大陆（判断条件 regionCode == "CN"）
    private static func isMainlandLocale() -> Bool {
        let locale = Locale.current
        if let regionCode = locale.regionCode, regionCode.uppercased() == "CN" {
            return true
        }
        if locale.identifier.lowercased().contains("cn") {
            return true
        }
        return false
    }
    
    
    /// IP查询接口返回值 Model
    private struct DeviceIPModel: Decodable {
        let country: String //China
        let countryCode: String //CN
        let ip: String //x.x.x.x
        
        enum CodingKeys: String, CodingKey {
            case country
            case countryCode
            case ip = "query"
        }
    }
    
    /// 判断出口IP是否中国大陆
    private static func isMainlandIPAddress() -> Bool {
        let reponse = Just.get("http://ip-api.com/json")
        
        if reponse.ok, let data = reponse.content {
            do {
                let model = try JSONDecoder().decode(DeviceIPModel.self, from: data)
                if model.countryCode == "CN" && model.country == "China" {
                    return true
                }
            } catch {}
        }
        return false
    }
    
}
