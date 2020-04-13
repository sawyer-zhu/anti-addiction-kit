
#import "GuideViewController.h"

@interface GuideViewController ()
@property (weak, nonatomic) IBOutlet UIButton *closeButton;
@property (weak, nonatomic) IBOutlet UITextView *textView;


@end

@implementation GuideViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.textView.text = @"SDK使用流程：\n\nApp启动\n\n1.配置sdk功能（可选）\n\n⇩\n\n2.配置用户时长（可选）\n\n⇩\n\n3.设置联网版服务器Host（可选）\n\n⇩\n\n4.初始化sdk（必选！！！）\n\n⇩\n\n5.登录用户login\n\n⇩\n\n6.其他操作\n\n\n\n";
    
    [self.closeButton addTarget:self action:@selector(dismiss) forControlEvents:UIControlEventTouchUpInside];
}

- (void)dismiss {
    [self dismissViewControllerAnimated:YES completion:nil];
}



@end
