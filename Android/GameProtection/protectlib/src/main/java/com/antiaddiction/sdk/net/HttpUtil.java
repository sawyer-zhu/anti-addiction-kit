package com.antiaddiction.sdk.net;

public class HttpUtil {

    public static void postAsyncWithRetry(final String urlStr, final String body, final NetUtil.NetCallback netCallback) {
        Async.runOnPool(new Runnable() {
            @Override
            public void run() {
                NetUtil.postSyncWithRetry(urlStr, body, netCallback);
            }
        });
    }

    public static void postAsync(final String urlStr, final String body, final NetUtil.NetCallback callback) {
        Async.runOnPool(new Runnable() {
            @Override
            public void run() {
                NetUtil.postSync(urlStr, body, callback);
            }
        });
    }

    public static void getAsync(final String urlStr, final NetUtil.NetCallback netCallback)  {
        Async.runOnPool(new Runnable() {
            @Override
            public void run() {
                NetUtil.getSync(urlStr, netCallback);
            }
        });
    }
    public static void getAsyncWithRetry(final String urlStr, final NetUtil.NetCallback netCallback)  {
        Async.runOnPool(new Runnable() {
            @Override
            public void run() {
                NetUtil.getSyncWithRetry(urlStr, netCallback);
            }
        });
    }
}
