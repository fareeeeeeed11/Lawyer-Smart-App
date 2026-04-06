package com.muhammad.lawyerapp;

import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Window window = getWindow();
        
        // 1. جعل التطبيق يمتد إلى حافة الشاشة أسفل أزرار النظام (Edge to Edge)
        WindowCompat.setDecorFitsSystemWindows(window, false);
        
        // 2. جعل أزرار النظام شفافة لكي يظهر تطبيقنا من تحتها مثل تطبيق مدرار تماماً
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setNavigationBarColor(Color.TRANSPARENT);
        window.setStatusBarColor(Color.TRANSPARENT);
    }
}