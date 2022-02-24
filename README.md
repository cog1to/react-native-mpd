# YAMD: MPD controller for mobile devices.
Simple iOS/Android app for controlling your MPD server.

[![appstore](https://img.shields.io/badge/App_Store-0D96F6?style=for-the-badge&logo=app-store&logoColor=white)](https://apps.apple.com/us/app/yamd/id1497463063) [![googleplay](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=ru.aint.mpd.mpd_wrapper)

## Building
Because we're using sockets, we have to "node-ify" core node modules and link them with the app. For that purpose we run `rn-nodeify` and `react-native link` commands after installing all the dependencies. // TODO: Check if this is still needed since linking is done automatically now.
```
npm install
rn-nodeify --install --hack
react-native link
```
## Running
Just run
```
react-native run-android/run-ios
```

Alternatively, you can launch dev server first:
```
react-native start --reset-cache
```
and then (in a separate terminal)
```
react-native run-android/run-ios
```
