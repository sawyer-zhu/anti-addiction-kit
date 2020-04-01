
import UIKit

struct Appearance {
    static var `default` = Appearance()
    
    var titleTextColor: UIColor
    var bodyTextColor: UIColor
    var tipTextColor: UIColor
    var placeholderColor: UIColor
    var iconColor: UIColor
    
    var whiteBackgroundColor: UIColor
    var blackBackgroundColor: UIColor
    var grayBackgroundColor: UIColor
    
    var titleFontSize: CGFloat
    var bodyFontSize: CGFloat
    var tipFontSize: CGFloat
    
    
    init() {
        titleTextColor = RGBA(51, 51, 51, 1)
        bodyTextColor = RGBA(153, 153, 153, 1)
        tipTextColor = RGBA(245, 245, 245, 1)
        placeholderColor = RGBA(187, 187, 187, 1)
        iconColor = RGBA(205, 205, 205, 1)
        
        whiteBackgroundColor = RGBA(255, 255, 255, 1)
        blackBackgroundColor = RGBA(0, 0, 0, 1)
        grayBackgroundColor = RGBA(77, 77, 77, 1)
        
        titleFontSize = 16
        bodyFontSize = 14
        tipFontSize = 12
    }
    
}


