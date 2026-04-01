import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourdomain.lawyerapp', // تأكد أن هذا نفس المعرف الخاص بتطبيقك
  appName: 'المحامي محمد الكامل',
  webDir: 'dist', // خليناها dist عشان GitHub Actions يبني صح
};

export default config;