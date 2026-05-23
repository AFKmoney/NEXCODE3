<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AI Studio Applet

This is a neural operating system applet built with Next.js and Capacitor.

## Mobile Version (Android)

An APK has been generated and is available in the root directory: [AI_Studio_v0.1.0_Debug.apk](./AI_Studio_v0.1.0_Debug.apk)

### How to build the APK yourself:

1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Sync Capacitor: `npx cap sync`
4. Build the APK: `cd android && ./gradlew assembleDebug`

## Run Locally (Web)

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
