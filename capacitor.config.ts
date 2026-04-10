import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.muhammad.lawyerapp', 
  appName: 'المحامي محمد الكامل',
  webDir: 'dist', 
  backgroundColor: '#0a0a0f', 
  plugins: {
    Keyboard: {
      resize: 'Native' // تم طرد الجني هنا! تسليم القيادة لنظام أندرويد 100%
    }
  }
};

export default config;