# MPD controller for mobile apps (working title)
Simple iOS/Android app for controlling your MPD server.

## Building
Because we're using sockets, we have to "node-ify" core node modules and link them with the app. For that purpose we run `en-nodeify` and `react-native link` commands after installing all the dependencies.
```
npm install
rn-nodeify --install --hack
react-native link
patch -n < mpd.patch
```
The `mpd.patch` thingy is a fix for existing MPD wrapper module that could not handle directory listings containing more than one file type.

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
