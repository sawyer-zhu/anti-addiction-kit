
### 2020-04-16  1.1.0 (iOS-1.1.0 & Android-1.1.0)

1. 新增接口 `setHost` 开启联网版（详见文档）
2. 文件变更：`AntiAddiction.cs`
#### iOS 文件变更
更新 `AntiAddictionKit.framework`

#### Android 文件变更
新增
- `antiLib.aar`

删除
- `android-support-compat.jar`
- `android-support-fragment.jar`
- `libAAK.jar`
- `localbroadcast.jar`
- `support-core-ui.jar`
- `res/`

### 2020-04-08  1.0.7(iOS-1.0.7 & Android-1.0.3)

1. 优化SDK

2. 更新iOS版本为1.0.7

3. 修改命名空间为AntiAddiction.OpenSource

> **注意**
> 
> **unitypackge 中默认iOS平台framework为真机架构，如需模拟器架构请在release包中提供的`AntiAddictionKit.xcframework`中找到并替换。Xcode11支持支持导入xcframework，会在构建时使用所包含的框架或库的正确平台版本。导出Xcode工程以后，可以使用`AntiAddictionKit.xcframework`替换`AntiAddictionKit.framework`,并做好以下配置即可。**


### 2020-04-02  1.0.6(iOS-1.0.6 & Android-1.0.3)

1.优化SDK

2.更新iOS版本为1.0.6

3.移除checkpaysync接口


### 2020-03-17  （1.0.3）

1.周末不算作节假日

### 2020-02-13  （1.0.2）

1.修复安卓主动调用实名界面时线程问题
2.修复iOS成年人账号调用登录漏发enter回调问题

### 2020-02-11  （1.0.1）

1.修改setUser接口为login,updateUser,logout三个接口
2.添加用户信息改变和SDK窗口消失回调


### 2020-01-21  （1.0.0）

1.添加配置类AntiAddictionConfig，可调用接口

public static void fuctionConfig(AntiAddictionConfig config)

配置SDK功能。

文件变更：

1.新增AntiAddictionConfig.cs

### 2020-01-20  （1.0.0）

1.添加回调CALLBACK_CODE_ENTER_SUCCESS，表示可以进入游戏

2.添加回调CALLBACK_CODE_AAT_WINDOW_SHOWN，表示SDK窗口弹出

具体说明见文档


### 2020-01-17  （1.0.0）

1.初始版本1.0.0
