# Beeline Driver

The app used by drivers for location tracking and passenger lists. Published as a web app, and also available on Google Play and the App Store.

# Deploying to Play/App Stores

## Android development
Install [Android Studio](https://developer.android.com/studio/index.html)  

Run `npm run deploy-android` to build an unsigned apk. Then run the following two commands to sign and zipalign the apk respectively.

```bash
jarsigner -verbose \
          -sigalg SHA1withRSA \
          -digestalg SHA1 \
          -keystore {{YOUR_KEYSTORE}}.keystore \
          platforms/android/build/outputs/apk/android-release-unsigned.apk \
          {{YOUR_KEYSTORE_ALIAS}}

# https://developer.android.com/studio/command-line/zipalign.html
zipalign -v 4 \
    platforms/android/build/outputs/apk/android-release-unsigned.apk \
    platforms/android/build/outputs/apk/{{YOUR_APK_NAME}}.apk
```


## iOS development
Run `npm run install-ios`

Open `platforms/ios/Beeline.xcodeproj` in Xcode

Select target platform to run (e.g. iPhone 6) and run it


# Contributing
We welcome contributions to code open sourced by the Government Technology Agency of Singapore. All contributors will be asked to sign a Contributor License Agreement (CLA) in order to ensure that everybody is free to use their contributions.
