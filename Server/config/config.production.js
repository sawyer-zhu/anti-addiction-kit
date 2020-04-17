/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
// config/config.${env}.js
const path = require('path');

module.exports = appInfo => {
    /**
     * built-in config
     * @type {Egg.EggAppConfig}
     **/
    const config = {
        mysql: {
            clients:{
                anti_addiction_kit_server: {
                    host: '',
                    port: '3306',
                    user: '',
                    password: '',
                    database: '',
                },
            },
            app: true,
            agent: false,
        }
    };


    config.proxy = true;

    config.maxProxyCount = 6;

    config.logger = {
        dir: path.join(appInfo.baseDir, '/logs/', appInfo.name),
        appLogName: `${appInfo.name}-web.log`,
        coreLogName: 'egg-web.log',
        agentLogName: 'egg-agent.log',
        errorLogName: 'common-error.log',
    }

    // add your middleware config here
    config.middleware = [];

    config.security = {
        csrf: {
            enable: false,
        },
    };

    config.view = {
        defaultViewEngine: 'nunjucks',
        mapping: {
            '.html': 'nunjucks' //左边写成.html后缀，会自动渲染.html文件
        },
    };

    // add your user config here
    const userConfig = {
        // myAppName: 'egg',
    };

    return {
        ...config,
        ...userConfig,
    };
};
