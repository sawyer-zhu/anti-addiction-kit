
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NetworkHelper : NSObject

+ (void)getTokenWith:(NSString *)userId completionHandler:(void (^)(NSString * _Nullable token))completionHandler;

@end

NS_ASSUME_NONNULL_END
