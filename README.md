# YAMD: MPD controller for mobile devices.
Simple iOS/Android app for controlling your MPD server.

[![appstore](https://img.shields.io/badge/App_Store-0D96F6?style=for-the-badge&logo=app-store&logoColor=white)](https://apps.apple.com/us/app/yamd/id1497463063) [![googleplay](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=ru.aint.mpd.mpd_wrapper)

## Building

I recommend using `npx` as a package runner to avoid installing React or Node/npm globally and mixing Node environments. All commands below start with `npx`, but you can strip it if you prefer to work with a global Node environment, or use a different package/environment runner.

#### Prerequisites

Obviously, since it's an MPD front-end, you'll need a running MPD instance configured to accept connections from external (non-localhost) IP addresses.

For iOS builds, you'll need Xcode 16+ & Cocoapods 1.11.x. [Homebrew](https://brew.sh) is your friend if you want to install Cocoapods without spending an extra hour figuring out what part of Ruby is not working again.

For Android, you'll need Android SDK 34 for building the app, and Java environment for running Gradle 8.8 (I use OpenJDK 22). If you don't do much Android development, chances are you'll need to download it from [OpenJDK Archive](http://jdk.java.net/archive/). You'll also need to tell gradle to use it, either by modifying your JAVA_HOME, adding JDK path to the PATH, or adding `org.gradle.java.home` parameter to `android/gradle.properties` config.

For example, you can do something like this before building or launching the app:
```
export JAVA_HOME=/usr/lib/jvm/java-22-openjdk
```

#### Node version

I use the following versions:
- Node: 18.20.7
- npm: 10.8.2

I can't guarantee that the project will build with any other version.

On some machines, an additional environment variable might be required to successfully run a development server:
```
export NODE_OPTIONS=--openssl-legacy-provider
```

#### Installing packages

`npx npm install`

#### Patching packages

Some packages will require modifications for building. Mostly it's because they're outdated and not supported any more. Out of my head:

- A few fail to build for Android because they use outdated 'compile' command in `build.gradle` files instead of `implementation`
- `react-native-udp` has a conflict with `react-native-tcp` because both use CocoaAsyncSocket. You need to open the workspace, find the `TcpSocket` sub-project, and 1. remove the cocoaAsyncSocket folder, 2. Add `CocoaAsyncSocket` as a dependency to the podfile.
- TBD...

#### Linking native packages.

Because we're using sockets, we have to "node-ify" core node modules and link them with the app. For that purpose we run `rn-nodeify` after installing all the dependencies.
```
npx rn-nodeify 'react-native-tcp' --install --hack
# OR
npx rn-nodeify --install --hack
```

#### Adding podfiles for iOS

```bash
cd ios
pod install
```

#### Fixing bunding stage for iOS

If you don't have React Native installed globally, you'll need to fix the bundling script to point to `node` executable. Otherwise Archive and/or Build commands will fail.

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

To specify Android device/simulator, add `--deviceId emulator-5554`, replacing the ID with your device or emulator ID. List of all connected devices can be found by running `adb devices`. For connecting to the locally run MPD on emulator, use `10.0.2.2` for the host value.

## Building release apps

### iOS

Open `ios/Yamd.workspace` with Xcode, select `Any device` as a target, and then `Product->Archive` from the top menu.

### Android

Depending on what version of node you have installed globally, you might need to change the `nodeExecutableAndArgs` variable in `android/app/build.gradle` to point to node 18.20.

Open `android` project folder in Android Studio and select `Build -> Generate Signed Build APK`.

