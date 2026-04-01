import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourdomain.lawyerapp', // استبدله بمعرف التطبيق الخاص بك إذا كان مختلفاً
  appName: 'المحامي محمد الكامل',
  webDir: 'dist', // 🔴 هذا هو الحل لمشكلة GitHub! (استخدم 'dist' أو 'build' بناءً على مجلد المخرجات في مشروعك)
  bundledWebRuntime: false,
  plugins: {
    Keyboard: {
      resize: 'none', // يمنع تدمير الشاشة ويجعل الكيبورد يطفو فوقها
      style: 'dark'   // يجعل الكيبورد يتناسب مع التطبيق الداكن
    }
  }
};

export default config;