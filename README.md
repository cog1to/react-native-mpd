# YAMD: MPD controller for mobile devices.
Simple iOS/Android app for controlling your MPD server.

[![appstore](https://img.shields.io/badge/App_Store-0D96F6?style=for-the-badge&logo=app-store&logoColor=white)](https://apps.apple.com/us/app/yamd/id1497463063) [![googleplay](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=ru.aint.mpd.mpd_wrapper)

## Building
I recommend using `npx` as a package runner to avoid installing React or Node/npm globally and mixing Node environments. All commands below start with `npx`, but you can strip it if you prefer to work with a global Node environment, or use a different package/environment runner.

#### Prerequisites
Obviously, since it's an MPD front-end, you'll need a running MPD instance configured to accept connections from external (non-localhost) IP addresses.

For iOS builds, you'll need Xcode 13.2 & Cocoapods 1.11.x. [Homebrew](https://brew.sh) is your friend if you want to install Cocoapods without spending an extra hour figuring out what part of Ruby is not working again.

For Android, you'll need Android SDK 30 for building the app, and Java 13 environment for running Gradle 6.9 (I use OpenJDK 13). If you don't do much Android development, chances are you'll need to download it from [OpenJDK Archive](http://jdk.java.net/archive/). You'll also need to tell gradle to use it, either by modifying your JAVA_HOME, adding JDK path to the PATH, or adding `org.gradle.java.home` parameter to `android/gradle.properties` config.

#### Node version
I use the following versions:
- Node: 17.3.0
- npm: 8.4.1

I can't guarantee that the project will build with any other version.

#### Installing packages
`npx npm install`

#### Adding podfiles for iOS
```bash
cd ios
pod install
```

#### Fixing bunding stage for iOS
If you don't have React Native installed globally, you'll need to fix the bundling script to point to `node` executable. Otherwise Archive and/or Build commands will fail.

#### Linking native packages.
Because we're using sockets, we have to "node-ify" core node modules and link them with the app. For that purpose we run `rn-nodeify` and `react-native link` commands after installing all the dependencies.
```
npx rn-nodeify --install --hack
npx react-native link
```

## Running
Just run
```
npx react-native run-android/run-ios
```

Alternatively, you can launch dev server first:
```
# --reset-cache option is useful if you often add/remove/upgrade packages.
npx react-native start --reset-cache 
```
and then (in a separate terminal)
```
npx react-native run-android/run-ios
```

To specify iOS simulator to run on, add something like `--simulator "iPhone 8 Plus"`, replacing the quoted string with whatever simulator you want.

To specify Android device/simulator, add `--deviceId emulator-5554`, replacing the ID with your device or emulator ID. List of all connected devices can be found by running `adb devices`. For connecting to the MPD on emulator, use `10.0.2.2` for the host.

## Building release apps

### iOS
Open `ios/Yamd.workspace` with Xcode, select `any device` as a target, and then `Product->Archive` from the top menu.

### Android
// TODO
