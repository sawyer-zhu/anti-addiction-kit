
#import "NetworkHelper.h"

@implementation NetworkHelper

+ (void)getTokenWith:(NSString *)userId completionHandler:(void (^)(NSString * _Nullable token))completionHandler {
    NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"http://172.26.129.132:7001/create_user_token?user_id=%@", userId]];
    
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        if (error == nil) {
            
            NSDictionary *dict = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
            if (dict) {
                NSString *token = dict[@"token"];
                if (token) {
                    completionHandler(token);
                    return;
                }
            }
        }
        
        completionHandler(@"");
    }];
    [dataTask resume];
}

@end
