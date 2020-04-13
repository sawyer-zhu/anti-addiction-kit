# anti-addiction-kit-server

基于[egg.js](https://eggjs.org/)开发，[api文档](ApiDoc.md)。



## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

#### 接入需知

1. 游戏方服务端需要生成一个包含用户唯一id的加密token给客户端调用接口，[代码](app/extend/help.js)。
nodejs代码：
````
function encryptUserInfo(data) {
    let keyPath = path.join(__dirname, '../../config/key/public.pem');
    let keyFile = fs.readFileSync(keyPath);
    let key = new NodeRSA(keyFile);
    let encrypted = key.encrypt(data, 'base64');
    return encrypted;
}
````
2. 用户身份证信息需要加密，加密方法可自行修改和实现，[代码](app/extend/encrypt.js)仅为示例。
3. 本项目对身份证信息真实性只作了简单的规则校验，并未验证是否的真实的身份证，可自己对接真实身份证校验的第三方服务。

### Deploy

#### 本地部署
1.cp config.production.js config.local.js
2.echo 'local' > env
3.[创建数据库](database/anti_addiction_kit_server.sql)，配置config.local.js里的数据库账号密码，日志等。
4.npm i
5.npm run dev

#### 线上部署

推荐使用[pm2](https://pm2.keymetrics.io/)，根据自己实际情况部署。
````
pm2 start server.js
````

### 测试后台（仅供测试使用）

#### 修改游戏时长
</dashboard>

#### 修改宵禁时间
</dashboard/config>

#### 生成加密包含用户信息加密token
</create_user_token>

*注意：该后台仅在开发或测试的时候使用，正式上线后请删掉或者注释掉。*

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.