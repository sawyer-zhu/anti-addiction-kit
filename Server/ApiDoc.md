# anti-addiction-kit-server

## 获取服务器时间
</v1/fcm/get_server_time>

**HTTP请求方式**

GET

**返回数据**

字段             | 类型           | 说明
--------------- | ------------- | ------------
timestamp       | int           | 当前服务器时间戳

````
{
    timestamp: 1585558394
}
````

## 获取防沉迷配置
</v1/fcm/get_config>

**HTTP请求方式**

GET

**返回数据**

字段             | 类型           | 说明
--------------- | ------------- | ------------
code            | int           | 状态码
data            | string        | 配置json


````
{
    code: 200,
    data: {
        version: "1.0.0",
        config: {
            nightStrictStart: "22:00",//宵禁开始时间
            nightStrictEnd: "08:00",//宵禁结束时间
            childCommonTime: 5400,//未成年游戏时长
            childHolidayTime: 10800,//未成年节假日游戏时长
        },
    },
}
````

## 用户授权
</v1/fcm/authorizations>

**HTTP请求方式**

POST

**请求数据**

字段             | 类型           | 说明
--------------- | ------------- | ------------
token           | string        | 通过客户端授权获得的token
local_user_info | string        | 单机版本地存的实名信息，有才传。

````
curl -v  -d 'token=12345&local_user_info=[{"userId":1,"name":"\u6d4b\u8bd5","identify":"342623201008147713"}]' http://localhost:7001/v1/fcm/authorizations

````

**返回数据**

字段             | 类型           | 说明
--------------- | ------------- | ------------
code            | int           | 状态码
data            | string        | 用户信息json

````
{
	"code": 200,
	"data": {
		"access_token": "1111",//jwt token,用于用户认证
		"birthday": "2000-03-24",//生日
		"age": 20 //年龄
	}
}
````
## 授权

用户授权接口返回的access_token
````
Authorization: Bearer <access_token>
````
## 获取游戏时长
</v1/fcm/set_play_log>

**HTTP请求方式**

POST
需要授权

**请求数据**
字段             | 类型           | 说明
--------------- | ------------- | ------------
play_logs       | string        | 时长json


````
curl -H 'Authorization: Bearer 121212121' -d  play_logs={"server_times":[[1585299472,1585299572]],"local_times":[[1585299472,1585299572]]}' http://localhost:7001/v1/fcm/set_play_log

````

**返回数据**

字段             | 类型           | 说明
--------------- | ------------- | ------------
code            | int           | 状态码
description     | string        | 提示文案
remainTime      | int           | 剩余时长
restrictType    | int           | 限制类型，1=> 宵禁，2=> 时长，0=> 无限制
title           | string        | 文案标题



````
{
    code: 200,
    description: "您今日游戏时间已达#20分钟#。根据国家相关规定，今日无法再进行游戏。请注意适当休息。",
    remainTime: 200,//剩余时长
    restrictType: 2,//1=> 宵禁，2=> 时长，0=> 无限制
    title: "健康游戏提示",
}
````

## 实名接口
</v1/fcm/real_user_info>

**HTTP请求方式**

POST
需要授权

**请求数据**
字段             | 类型           | 说明
--------------- | ------------- | ------------
name            | string        | 姓名
identify        | string        | 身份证

````
curl -H 'Authorization: Bearer 121212121' -d  name=测试&identify=123' http://localhost:7001/v1/fcm/real_user_info

````

**返回数据**

字段             | 类型           | 说明
--------------- | ------------- | ------------
code            | int           | 状态码
data            | string        | 用户信息json



````
{
    code: 200,
	"data": {
		"age": 20 //年龄
	},
}
````

## 检查是否能充值
</v1/fcm/check_pay>

**HTTP请求方式**

POST
需要授权

**请求数据**
字段             | 类型           | 说明
--------------- | ------------- | ------------
amount          | int           | 充值金额（单位：元）

````
curl -H 'Authorization: Bearer 121212121' -d  amount=10' http://localhost:7001/v1/fcm/check_pay

````

**返回数据**

字段             | 类型           | 说明
--------------- | ------------- | ------------
code            | int           | 状态码
check           | int           | 1=>可以付费，0=>不能付费
title           | string        | 文案标题
description     | string        | 文案描述



````
{
    code: 200,
	check: 0,
	title: "健康消费提醒",
	description : "根据国家相关规定，当前您无法使用充值相关功能。 
}
````

## 付费数据上传
</v1/fcm/submit_pay>

**HTTP请求方式**

POST
需要授权

**请求数据**
字段             | 类型           | 说明
--------------- | ------------- | ------------
amount          | int           | 充值金额（单位：元）

````
curl -H 'Authorization: Bearer 121212121' -d  amount=10' http://localhost:7001/v1/fcm/submit_pay

````

**返回数据**

字段             | 类型           | 说明
--------------- | ------------- | ------------
code            | int           | 状态码
result          | int           | 1=>成功，0=>失败



````
{
    code: 200,
	check: 0,
	title: "健康消费提醒",
	description : "根据国家相关规定，当前您无法使用充值相关功能。 
}
````


## http状态码

状态码          | 说明          
---------------| ------------- 
200            | 成功
400            | 参数错误，token无效等
404            | 用户信息不存在
500            | 服务器错误
