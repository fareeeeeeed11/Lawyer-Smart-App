import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // ... إعداداتك السابقة
  plugins: {
    Keyboard: {
      resize: 'none', // هذا الأمر يمنع تدمير الشاشة ويجعل الكيبورد يطفو فوقها
      style: 'dark' // اختياري: لجعل الكيبورد يتناسب مع تطبيقك الداكن
    }
  }
};

export default config;