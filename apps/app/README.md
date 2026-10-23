# AgentHarbor Mobile

This Expo app is the Android and web client for AgentHarbor. It stores agents, routines and conversations on the device. For live answers, configure an OpenAI-compatible local model endpoint under Settings.

## Run on an Android phone

1. Install Expo Go on the phone.
2. From the repository root, run `npm install`, then `npm run android`.
3. Scan the QR code shown in the terminal with Expo Go. Keep both devices on the same Wi-Fi network.
4. For a model running on the computer, enter the computer’s LAN address under Settings. A phone’s `localhost` points to the phone itself.

For a standalone APK, use the `preview` profile in `eas.json` with Expo Application Services. A compatible Android SDK and JDK are needed for a local native build.
