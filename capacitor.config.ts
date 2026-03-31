import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.muhammad.lawyerapp',
  appName: 'LawyerApp',
  webDir: 'dist',
  backgroundColor: '#0a0a0f',
  plugins: {
    Keyboard: {
      resize: "Native",
      style: "dark",
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
