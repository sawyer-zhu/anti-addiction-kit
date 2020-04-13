package com.seraph.sharecode;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;


import java.util.Date;

public class MainActivity extends Activity {
    TextView tv_code;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        tv_code = findViewById(R.id.tv_code);
        tv_code.setText(getShareCode());
    }


    String getShareCode(){
        long time = new Date().getTime() / 1000;
        Hashids hashids = new Hashids("AntiAddictionKit",6);
        String code =hashids.encode(time);
        return code;
    }

    public void getShareCode(View view){
        tv_code.setText(getShareCode());
    }


}
