
import Foundation

final class DateHelper {
    
    //禁用初始化方法
    @available(*, unavailable)
    init() {
        fatalError("DateHelper-init is unavailable")
    }
    
    
    /// get Date? (instance or nil) from yyyyMMdd style string
    /// - Parameter from: yyyyMMdd style string
    class func dateFromyyyMMdd(_ from: String) -> Date? {
        return Date(fromString: from, format: .custom("yyyyMMdd"))
    }
    
    
    /// 是否同一天
    class func isSameDay(_ lhs: Date, _ rhs: Date) -> Bool {
        return lhs.compare(.isSameDay(as: rhs))
    }
    
    /// 是否同一月
    class func isSameMonth(_ lhs: Date, _ rhs: Date) -> Bool {
        return lhs.compare(.isSameMonth(as: rhs))
    }
    
    
    /// get age from yyyyMMdd
    class func getAge(_ dateString: String) -> Int {
        guard let date = self.dateFromyyyMMdd(dateString) else { return -1 }
        
        // 出生时间 年月日
        let birthYear = Calendar.current.component(.year, from: date)
        let birthMouth = Calendar.current.component(.month, from: date)
        let birthDay = Calendar.current.component(.day, from: date)
        
        // 当前时间 年月日
        let currentYear = Calendar.current.component(.year, from: Date())
        let currentMouth = Calendar.current.component(.month, from: Date())
        let currentDay = Calendar.current.component(.day, from: Date())
        
        var age: Int = currentYear - birthYear
        //如果当前日月<出生日月
        if ((birthMouth > currentMouth) || (birthMouth == currentMouth && birthDay > currentDay)){
            age -= 1
        }

        return age
    }
    
}

extension DateHelper {
    
    /// 判断是否宵禁时间
    class func isCurfew(_ date: Date) -> Bool {
        let date = Date()
        if let hour = date.component(.hour), let minute = date.component(.minute) {
            let curfewStart = DateHelper.timeSetFromNightStrictTimeString(AntiAddictionKit.configuration.nightStrictStart)
            let curfewEnd = DateHelper.timeSetFromNightStrictTimeString(AntiAddictionKit.configuration.nightStrictEnd)
            if (curfewStart.hour <= hour) || (hour < curfewEnd.hour) || (curfewStart.hour == hour && minute < curfewStart.minute) || (curfewEnd.hour == hour && minute < curfewEnd.minute) {
                return true
            }
        }
        return false
    }
    
    /// 获取距离下一次宵禁的时间间隔
    /// - Returns: 单位为秒( return >= 0)
    class func intervalForNextCurfew() -> Int {
        //晚上22点的时间 = 24点-2小时
        let startHour = DateHelper.timeSetFromNightStrictTimeString(AntiAddictionKit.configuration.nightStrictStart).hour
        let startMinute = DateHelper.timeSetFromNightStrictTimeString(AntiAddictionKit.configuration.nightStrictStart).minute
        //宵禁时间与24点的时间查 单位秒
        let curfewStartTo24HourInterval: Int = 24*60*60 - startHour*60*60 - startMinute*60
        let nowTo24HourInterval: Int = Int(Date().dateFor(.endOfDay).timeIntervalSinceNow)
        let interval: Int = max(nowTo24HourInterval - curfewStartTo24HourInterval, 0)
        return interval
    }
    
    
    /// 将整数小时 `22` 格式的字符串转化成 `时:分`格式，例如 22 -> 22:00
    class func formatCurfewHourToHHmm(_ hour: Int) -> String {
        var timeString = ""
        if hour > 10 {
            timeString = "\(hour):00"
        } else {
            timeString = "0\(hour):00"
        }
        return timeString
    }
    
    /// 将时分 `22:00` 格式的字符串转化成(小时: 22，分: 0)，24小时制
    /// - Parameter timeString: 防沉迷时间格式
    /// - Returns: 小时和分的整数集合 (小时: 22，分: 0)
    typealias NightStrictTimeSet = (hour: Int, minute: Int)
    class func timeSetFromNightStrictTimeString(_ timeString: String) -> NightStrictTimeSet {
        //检查冒号的index
        let array = timeString.components(separatedBy: ":")
        assert(array.count == 2)
        let hString: String = array[safe: 0] ?? "22"
        let mString: String = array[safe: 1] ?? "0"
        let h: Int = Int(hString) ?? 22
        let m: Int = Int(mString) ?? 0
        return NightStrictTimeSet(hour: h, minute: m)
    }
    
    
    /// 是否节假日
    class func isHoliday(_ date: Date) -> Bool {
        
        // 是否周末
        // 审核时判定周末!=节假日，因此注释周末判断逻辑
//        if date.compare(.isWeekend) {
//            return true
//        }
        
        // 是否节日
        // TODO: 目前只能确定 2020 年法定节假日，之后时间需及时更新
        let yyyy = date.toString(format: .isoYear)
        let MMdd = date.toString(format: .custom("MMdd"))
        let holiday2020: [String] = ["0101", //元旦1天
                                    "0124", "0125", "0126", "0127", "0128", "0129", "0130", //春节7天
                                    "0404", "0405", "0406", //清明3天
                                    "0501", "0502", "0503", "0504", "0505", //劳动节5天
                                    "0625", "0626", "0627", //端午节 3天
                                    "1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008" //国庆中秋 8天
        ]
        if yyyy == "2020" && holiday2020.contains(MMdd) {
            return true
        }
        
        // 剩余情况
        return false
    }

}
