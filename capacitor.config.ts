import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourdomain.lawyerapp', // تأكد أن هذا نفس المعرف الخاص بتطبيقك
  appName: 'المحامي محمد الكامل',
  webDir: 'dist', // خليناها dist عشان GitHub Actions يبني صح
  
  // الإضافات الجديدة لحل المشكلة تبدأ من هنا 👇
  backgroundColor: '#0a0a0f', // هذا سيجعل الفراغ الرمادي أسود داكن ولن تلاحظه
  plugins: {
    Keyboard: {
      resize: 'body', // يمنع تشوه الشاشة وتمددها عند فتح الكيبورد
      resizeOnFullScreen: true
    }
  }
};

export default config;