
import Foundation

struct Logger {
    
    /// debug log
    static func debug(_ items: Any...) {
        #if DEBUG
        let s = items.reduce("") { result, next in
            return result + String(describing: next)
        }
        Swift.print("[Debug] \(s)")
        #endif
    }
    
    /// 业务逻辑 log
    static func info(_ items: Any...) {
        #if DEBUG
        let s = items.reduce("") { result, next in
            return result + String(describing: next)
        }
        Swift.print("[AntiAddictionAKit] \(s)")
        #endif
    }
    
}


