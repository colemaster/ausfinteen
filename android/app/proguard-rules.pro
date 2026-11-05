# Keep JavaScriptInterface bridge methods intact for R8/ProGuard
-keepattributes JavascriptInterface
-keepattributes *Annotation*

-keepclassmembers class com.ausfintools.app.MainActivity$AndroidWebBridge {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class com.ausfintools.app.MainActivity { *; }
-keep class com.ausfintools.app.MainActivity$* { *; }
