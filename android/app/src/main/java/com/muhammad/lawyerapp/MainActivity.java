package com.muhammad.lawyerapp;

import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Window window = getWindow();
        
        // إيقاف وضع Edge-to-Edge لأنه يسبب تداخل الأزرار مع الأيقونات ويخفي الكيبورد
        // وضعنا لون الأزرار ليكون مطابقاً تماماً للون تطبيقنا السفلي ليندمج بشكل مثالي
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setNavigationBarColor(Color.parseColor("#15151e"));
        window.setStatusBarColor(Color.parseColor("#0a0a0f"));
    }
}