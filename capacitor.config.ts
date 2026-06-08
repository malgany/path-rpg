import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.rpg2dmobile.web",
  appName: "Path RPG",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
