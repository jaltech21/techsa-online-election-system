import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.techsa.toes',
  appName: 'TOES',
  webDir: 'dist',
  // When running on a real device, set VITE_API_BASE_URL in your .env.production
  // to point at your deployed Rails API (e.g. https://api.techsa.com).
  // The server block below is only used by `npx cap run` for local development.
  server: {
    // Uncomment and set to your local machine IP when testing on a physical device:
    // url: 'http://192.168.1.x:3000',
    cleartext: true, // allow HTTP on Android during development
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: true, // allow HTTP during development
  },
}

export default config
