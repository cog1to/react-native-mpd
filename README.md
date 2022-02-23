# MPD controller for mobile apps (working title)
Simple iOS/Android app for controlling your MPD server.

[![appstore](https://img.shields.io/badge/App_Store-0D96F6?style=for-the-badge&logo=app-store&logoColor=white)](https://apps.apple.com/us/app/yamd/id1497463063) [![googleplay](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=ru.aint.mpd.mpd_wrapper)

## Building
Because we're using sockets, we have to "node-ify" core node modules and link them with the app. For that purpose we run `en-nodeify` and `react-native link` commands after installing all the dependencies.
```
npm install
rn-nodeify --install --hack
react-native link
```
## Running
```
react-native run-android/run-ios
```
or
```
react-native start
```
and then (in a separate terminal)
```
react-native run-android/run-ios
```
