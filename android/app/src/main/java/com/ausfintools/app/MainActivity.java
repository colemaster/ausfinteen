package com.ausfintools.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * MainActivity for AusTeen Money / AusFinTools (v7.12.0).
 *
 * Hosts the complete offline Astro 7 + React 19 application bundle inside a
 * hardware-accelerated Chromium WebView served via a virtual HTTPS origin
 * (https://appassets.androidplatform.net) with native bridges for:
 *  - PDF / Print export via Android PrintManager (window.print())
 *  - Native Android Share Sheet (navigator.share & AndroidBridge.shareContent)
 *  - Native Clipboard copy & External statutory link routing (ATO, Fair Work, QLD Gov, TransLink)
 *  - Android Home-Screen App Shortcuts & Deep Links (ausfintools:// & https://ausfintools.com)
 *  - Predictive Back & Hardware Back navigation
 */
public class MainActivity extends Activity {

    private static final String VIRTUAL_HOST = "appassets.androidplatform.net";
    private static final String CANONICAL_HOST = "ausfintools.com";
    private static final String BASE_URL = "https://" + VIRTUAL_HOST + "/";
    private static final String ASSET_ROOT = "public";

    private WebView webView;
    private ProgressBar progressBar;
    private OnBackInvokedCallback backInvokedCallback;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        configureSystemBars();

        // Root container with WebView + thin top loading indicator
        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setBackgroundColor(Color.parseColor("#090D16"));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#090D16"));
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setVisibility(View.GONE);
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dpToPx(3),
                Gravity.TOP
        );

        rootLayout.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        rootLayout.addView(progressBar, progressParams);
        setContentView(rootLayout);

        configureWebSettings(webView.getSettings());

        webView.addJavascriptInterface(new AndroidWebBridge(this), "AndroidBridge");
        webView.setWebViewClient(new LocalAssetWebViewClient());
        webView.setWebChromeClient(new NativeWebChromeClient());
        webView.setDownloadListener(new NativeDownloadListener());

        registerBackNavigation();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            String initialUrl = resolveIntentUrl(getIntent());
            webView.loadUrl(initialUrl);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String targetUrl = resolveIntentUrl(intent);
        if (webView != null && targetUrl != null) {
            webView.loadUrl(targetUrl);
        }
    }

    private void configureSystemBars() {
        Window window = getWindow();
        if (window != null) {
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.parseColor("#090D16"));
            window.setNavigationBarColor(Color.parseColor("#090D16"));
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebSettings(WebSettings settings) {
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setTextZoom(100);
        settings.setUserAgentString(settings.getUserAgentString() + " AusFinToolsAndroid/7.12.0");
    }

    private void registerBackNavigation() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            backInvokedCallback = () -> {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            };
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                    backInvokedCallback
            );
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    /**
     * Converts deep-link or home-screen shortcut intents into our virtual HTTPS origin URL.
     */
    private String resolveIntentUrl(Intent intent) {
        if (intent == null || intent.getData() == null) {
            return BASE_URL;
        }
        Uri data = intent.getData();
        String scheme = data.getScheme();
        String path = data.getPath();
        String query = data.getEncodedQuery();

        if ("ausfintools".equalsIgnoreCase(scheme)) {
            // e.g. ausfintools://open/brisbane-qld?tab=firstjob
            String cleanPath = (path != null && !path.isEmpty()) ? path : "/";
            if (!cleanPath.startsWith("/")) {
                cleanPath = "/" + cleanPath;
            }
            return "https://" + VIRTUAL_HOST + cleanPath + (query != null ? "?" + query : "");
        }

        if ("https".equalsIgnoreCase(scheme) && data.getHost() != null
                && data.getHost().endsWith(CANONICAL_HOST)) {
            String cleanPath = (path != null && !path.isEmpty()) ? path : "/";
            return "https://" + VIRTUAL_HOST + cleanPath + (query != null ? "?" + query : "");
        }

        return BASE_URL;
    }

    /**
     * Serves the compiled Astro static bundle from APK assets/public/ over
     * https://appassets.androidplatform.net/ so ES modules, ClientRouter,
     * View Transitions, and localStorage work offline with zero network dependency.
     */
    private class LocalAssetWebViewClient extends WebViewClient {

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (uri == null || uri.getHost() == null) {
                return super.shouldInterceptRequest(view, request);
            }

            String host = uri.getHost().toLowerCase(Locale.ROOT);
            boolean isInternalHost = VIRTUAL_HOST.equals(host)
                    || CANONICAL_HOST.equals(host)
                    || ("www." + CANONICAL_HOST).equals(host);

            if (!isInternalHost) {
                return super.shouldInterceptRequest(view, request);
            }

            String rawPath = uri.getPath();
            if (rawPath == null || rawPath.isEmpty()) {
                rawPath = "/";
            }

            // Serve a lightweight no-op Service Worker so navigator.serviceWorker.register('/sw.js')
            // succeeds cleanly without duplicating APK assets into WebView cache storage.
            if ("/sw.js".equals(rawPath)) {
                String noopSw = "self.addEventListener('install',()=>self.skipWaiting());"
                        + "self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));";
                return createResponse(
                        "application/javascript",
                        "UTF-8",
                        200,
                        "OK",
                        new ByteArrayInputStream(noopSw.getBytes(StandardCharsets.UTF_8)),
                        false
                );
            }

            return loadAssetResponse(rawPath);
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (uri == null) return false;

            String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase(Locale.ROOT) : "";
            String host = uri.getHost() != null ? uri.getHost().toLowerCase(Locale.ROOT) : "";

            // Keep internal app navigation inside the WebView
            if (("https".equals(scheme) || "http".equals(scheme))
                    && (VIRTUAL_HOST.equals(host) || CANONICAL_HOST.equals(host) || ("www." + CANONICAL_HOST).equals(host))) {
                if (!VIRTUAL_HOST.equals(host)) {
                    String newUrl = "https://" + VIRTUAL_HOST
                            + (uri.getPath() != null ? uri.getPath() : "/")
                            + (uri.getEncodedQuery() != null ? "?" + uri.getEncodedQuery() : "")
                            + (uri.getEncodedFragment() != null ? "#" + uri.getEncodedFragment() : "");
                    view.loadUrl(newUrl);
                    return true;
                }
                return false;
            }

            // Open external government / bank / university links (ATO, Fair Work, QLD Gov, TransLink, etc.),
            // mailto:, and tel: links in the user's native Android browser or handler app.
            openExternalUri(uri);
            return true;
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            if (progressBar != null) {
                progressBar.setProgress(15);
                progressBar.setVisibility(View.VISIBLE);
            }
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            if (progressBar != null) {
                progressBar.setVisibility(View.GONE);
            }
            injectNativeEnhancements(view);
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            super.onReceivedError(view, request, error);
            if (request != null && request.isForMainFrame()) {
                view.loadUrl(BASE_URL);
            }
        }
    }

    /**
     * Injects native bridges into the web context so window.print() invokes Android's
     * native PrintManager (Save as PDF) and navigator.share() falls back to Android's
     * native Share Sheet chooser.
     */
    private void injectNativeEnhancements(WebView view) {
        String js = "(function(){"
                + "if(window.__ausfinAndroidInjected)return;"
                + "window.__ausfinAndroidInjected=true;"
                + "window.print=function(){"
                + "  if(window.AndroidBridge&&window.AndroidBridge.printPage){"
                + "    window.AndroidBridge.printPage(document.title||'AusTeen Money');"
                + "  }"
                + "};"
                + "if(!navigator.share&&window.AndroidBridge){"
                + "  navigator.share=function(data){"
                + "    return new Promise(function(resolve){"
                + "      var t=(data&&data.title)||document.title||'AusTeen Money';"
                + "      var x=(data&&data.text)||'';"
                + "      var u=(data&&data.url)||window.location.href;"
                + "      window.AndroidBridge.shareContent(t,x,u);"
                + "      resolve();"
                + "    });"
                + "  };"
                + "}"
                + "})();";
        view.evaluateJavascript(js, null);
    }

    private WebResourceResponse loadAssetResponse(String rawPath) {
        AssetManager assets = getAssets();
        String cleanPath = rawPath;
        while (cleanPath.startsWith("/")) {
            cleanPath = cleanPath.substring(1);
        }

        // Candidate asset paths in priority order:
        // 1. Exact path (if it has a file extension like .js, .css, .jpg, .woff2, .html)
        // 2. Directory index: public/<path>/index.html
        // 3. Direct HTML file: public/<path>.html
        String[] candidates;
        if (cleanPath.isEmpty()) {
            candidates = new String[]{ASSET_ROOT + "/index.html"};
        } else if (hasFileExtension(cleanPath)) {
            candidates = new String[]{ASSET_ROOT + "/" + cleanPath};
        } else {
            String trimmed = cleanPath.endsWith("/")
                    ? cleanPath.substring(0, cleanPath.length() - 1)
                    : cleanPath;
            candidates = new String[]{
                    ASSET_ROOT + "/" + trimmed + "/index.html",
                    ASSET_ROOT + "/" + trimmed + ".html",
                    ASSET_ROOT + "/" + trimmed
            };
        }

        for (String candidate : candidates) {
            try {
                InputStream stream = assets.open(candidate);
                String mimeType = guessMimeType(candidate);
                String encoding = isTextMime(mimeType) ? "UTF-8" : null;
                boolean immutable = candidate.contains("/_astro/") || candidate.contains("/fonts/");
                return createResponse(mimeType, encoding, 200, "OK", stream, immutable);
            } catch (IOException ignored) {
                // Try next candidate
            }
        }

        // If an HTML navigation route was not found, serve 404.html or index.html
        if (!hasFileExtension(cleanPath) || cleanPath.endsWith(".html")) {
            try {
                InputStream fallback = assets.open(ASSET_ROOT + "/404.html");
                return createResponse("text/html", "UTF-8", 200, "OK", fallback, false);
            } catch (IOException ignored) {
                try {
                    InputStream indexFallback = assets.open(ASSET_ROOT + "/index.html");
                    return createResponse("text/html", "UTF-8", 200, "OK", indexFallback, false);
                } catch (IOException ignored2) {
                    // Fall through
                }
            }
        }

        return createResponse(
                "text/plain",
                "UTF-8",
                404,
                "Not Found",
                new ByteArrayInputStream("Not Found".getBytes(StandardCharsets.UTF_8)),
                false
        );
    }

    private WebResourceResponse createResponse(
            String mimeType,
            String encoding,
            int statusCode,
            String reasonPhrase,
            InputStream data,
            boolean immutableCache
    ) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        if (immutableCache) {
            headers.put("Cache-Control", "public, max-age=31536000, immutable");
        } else {
            headers.put("Cache-Control", "no-cache");
        }
        return new WebResourceResponse(mimeType, encoding, statusCode, reasonPhrase, headers, data);
    }

    private static boolean hasFileExtension(String path) {
        int lastSlash = path.lastIndexOf('/');
        String fileName = lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
        return fileName.indexOf('.') > 0;
    }

    private static boolean isTextMime(String mime) {
        return mime != null && (
                mime.startsWith("text/")
                        || mime.contains("javascript")
                        || mime.contains("json")
                        || mime.contains("xml")
                        || mime.contains("svg")
        );
    }

    private static String guessMimeType(String path) {
        String lower = path.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html";
        if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".json") || lower.endsWith(".webmanifest")) return "application/json";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".woff")) return "font/woff";
        if (lower.endsWith(".ttf")) return "font/ttf";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".avif")) return "image/avif";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".xml")) return "application/xml";
        if (lower.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }

    private void openExternalUri(Uri uri) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(this, "Could not open external link: " + uri.toString(), Toast.LENGTH_SHORT).show();
        }
    }

    private class NativeWebChromeClient extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView view, int newProgress) {
            if (progressBar != null) {
                progressBar.setProgress(newProgress);
                if (newProgress >= 100) {
                    progressBar.setVisibility(View.GONE);
                } else if (progressBar.getVisibility() != View.VISIBLE) {
                    progressBar.setVisibility(View.VISIBLE);
                }
            }
        }

        @Override
        public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
            return true;
        }
    }

    private class NativeDownloadListener implements DownloadListener {
        @Override
        public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
            if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                openExternalUri(Uri.parse(url));
            }
        }
    }

    /**
     * JavaScript-to-Android bridge exposed as `window.AndroidBridge`.
     */
    public class AndroidWebBridge {
        private final Context context;

        AndroidWebBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public void printPage(final String jobTitle) {
            runOnUiThread(() -> {
                try {
                    PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                    if (printManager != null && webView != null) {
                        String safeTitle = (jobTitle != null && !jobTitle.trim().isEmpty())
                                ? jobTitle.trim()
                                : "AusTeen Money Document";
                        PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(safeTitle);
                        printManager.print(safeTitle, adapter, new PrintAttributes.Builder().build());
                    }
                } catch (Exception e) {
                    Toast.makeText(context, "Unable to launch PDF / Print service", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void shareContent(final String title, final String text, final String url) {
            runOnUiThread(() -> {
                try {
                    String cleanUrl = url != null
                            ? url.replace(VIRTUAL_HOST, CANONICAL_HOST)
                            : "https://" + CANONICAL_HOST;
                    StringBuilder body = new StringBuilder();
                    if (text != null && !text.trim().isEmpty()) {
                        body.append(text.trim()).append("\n\n");
                    }
                    body.append(cleanUrl);

                    Intent sendIntent = new Intent(Intent.ACTION_SEND);
                    sendIntent.setType("text/plain");
                    if (title != null && !title.trim().isEmpty()) {
                        sendIntent.putExtra(Intent.EXTRA_SUBJECT, title.trim());
                    }
                    sendIntent.putExtra(Intent.EXTRA_TEXT, body.toString());

                    Intent chooser = Intent.createChooser(
                            sendIntent,
                            title != null && !title.isEmpty() ? title : "Share via"
                    );
                    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(chooser);
                } catch (Exception e) {
                    Toast.makeText(context, "Unable to open Share menu", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void copyToClipboard(final String label, final String text) {
            runOnUiThread(() -> {
                ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (clipboard != null && text != null) {
                    ClipData clip = ClipData.newPlainText(label != null ? label : "AusTeen Money", text);
                    clipboard.setPrimaryClip(clip);
                    Toast.makeText(context, "Copied to clipboard", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void openExternalUrl(final String url) {
            runOnUiThread(() -> {
                if (url != null && !url.isEmpty()) {
                    openExternalUri(Uri.parse(url));
                }
            });
        }

        @JavascriptInterface
        public String getAppVersion() {
            return "7.12.0";
        }
    }

    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && backInvokedCallback != null) {
            getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(backInvokedCallback);
        }
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
