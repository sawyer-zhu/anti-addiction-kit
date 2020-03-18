
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using AntiAddiction.StandAlone;
using System;

/*
	version 1.0.1
 */

public class Demo : MonoBehaviour {
	public Action<int,string> onAntiAddictionResult;
	// Use this for initialization
	void Start () {
		
	}
	
	// Update is called once per frame
	void Update () {
		
	}

	void OnApplicationPause(bool pauseStatus){
		if (pauseStatus)
		{
			AntiAddiction.StandAlone.AntiAddiction.onStop();

		}else
		{
			AntiAddiction.StandAlone.AntiAddiction.onResume();

		}
	}

	void OnGUI() {
		GUIStyle myButtonStyle = new GUIStyle(GUI.skin.button)
		{
			fontSize = 50
		};

		GUIStyle myLabelStyle = new GUIStyle(GUI.skin.label)
		{
			fontSize = 30
		};


		GUI.depth = 0;

		if (GUI.Button(new Rect(50, 200, 300, 60), "初始化", myButtonStyle))
		{
			onAntiAddictionResult += onAntiAddictionHandler;
			AntiAddiction.StandAlone.AntiAddiction.init(onAntiAddictionResult);
		}

		if (GUI.Button(new Rect(50, 300, 300, 60), "登录", myButtonStyle))
		{
			AntiAddiction.StandAlone.AntiAddiction.login("1234567",0);
		}

		if (GUI.Button(new Rect(50, 380, 380, 60), "更新用户信息", myButtonStyle))
		{
			AntiAddiction.StandAlone.AntiAddiction.updateUserType(4);
		}

		if (GUI.Button(new Rect(50, 460, 300, 60), "登出", myButtonStyle))
		{
			AntiAddiction.StandAlone.AntiAddiction.logout();
		}

		if (GUI.Button(new Rect(50, 540, 380, 60), "检查付费限制", myButtonStyle))
		{
			AntiAddiction.StandAlone.AntiAddiction.checkPayLimit(200);
		}

		if (GUI.Button(new Rect(50, 610, 300, 60), "付费成功", myButtonStyle))
		{
			AntiAddiction.StandAlone.AntiAddiction.paySuccess(100);
		}

		// if (GUI.Button(new Rect(50, 690, 460, 60), "同步检查付费限制", myButtonStyle))
		// {
		// 	int result = AntiAddiction.StandAlone.AntiAddiction.checkPayLimitSync(200);
		// 	Debug.Log("checkPayLimitSync" + result);
		// }

		if (GUI.Button(new Rect(50, 770, 380, 60), "检查聊天限制", myButtonStyle))
		{
			AntiAddiction.StandAlone.AntiAddiction.checkChatLimit();
		}

		if (GUI.Button(new Rect(50, 850, 300, 60), "配置SDK", myButtonStyle))
		{
			AntiAddictionConfig config = new AntiAddictionConfig.Builder ()
			.UseSdkRealName (true)
			.UseSdkPaymentLimit (true)
			.UseSdkOnlineTimeLimit(true)
			.ShowSwitchAccountButton (false)
			.Build ();

			AntiAddiction.StandAlone.AntiAddiction.fuctionConfig(config);
			// AntiAddiction.StandAlone.AntiAddiction.fuctionConfig(false,true,true);
		}

		if (GUI.Button(new Rect(50, 930, 330, 60), "获取用户类型", myButtonStyle))
		{
			int userType = AntiAddiction.StandAlone.AntiAddiction.getUserType("12345");
			Debug.Log("getUserType" + userType);
		}

		if (GUI.Button(new Rect(50, 1010, 330, 60), "打开实名", myButtonStyle))
		{
			AntiAddiction.StandAlone.AntiAddiction.openRealName();
		}
	}

	public void onAntiAddictionHandler (int resultCode,string msg){
		Debug.Log("onAntiAddictionHandler" + resultCode);
	}
}
