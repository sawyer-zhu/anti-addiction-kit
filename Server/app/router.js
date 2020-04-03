'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const fcm = app.middleware.fcm(app);
  const checkToken = app.middleware.checkToken(app);
  router.post('/v1/fcm/set_play_log', checkToken, fcm, controller.v1.fcm.setPlayLog);
  router.post('/v1/fcm/real_user_info', checkToken, controller.v1.fcm.realUserInfo);
  router.post('/v1/fcm/check_pay', checkToken, controller.v1.fcm.checkPay);
  router.post('/v1/fcm/submit_pay', checkToken, controller.v1.fcm.submitPay);
  router.get('/v1/fcm/get_server_time', controller.v1.fcm.getServerTime);
  router.post('/v1/fcm/authorizations', controller.v1.authorizations.index);
  router.get('/v1/fcm/get_config', controller.v1.fcm.getConfig);

  router.get('/dashboard', controller.dashboard.index);//仅用于测试修改时长
  router.post('/dashboard/edit_remain_duration', controller.dashboard.editRemainDuration);//仅用于测试修改时长
  router.get('/create_user_token', controller.dashboard.createUserToken);//仅用于测试生成token


};
