# Twitch Desktop Client (Unofficial)

![gamelist](http://i.imgur.com/aujAPcP.png)
![channellist](http://i.imgur.com/Gt2z37x.png)
![player](http://i.imgur.com/c3RXF4U.png)

## Working right now
+ Browse games and live streams
+ Play live streams (without Flash!)
+ User login and current online streams list
+ Chat

## Upcoming
- Browse and play VODs
- Ability to follow streams and games
- Push notifications
- Chromecast support
- Autoupdater
- Something more 

## Downloads

[Downloads](https://github.com/hzeroo/twitch-desktop/releases)

## Techs behind
+ [Electron](http://electron.atom.io/)
+ [Angular 2](https://angular.io/)
+ [Material 2](github.com/angular/material2)
+ [Typescript](https://www.typescriptlang.org/)
+ [Webpack](https://webpack.github.io/)

## Get it running from source

To get started, clone the repo to your target directory. This app uses Webpack, and a few commands have been provided as scripts in `package.json`.

```bash
npm install
cd src && npm install && cd ..

mv src/app/config.example.ts src/app/config.ts

# Now you need to edit config.ts with a proper client_id from twitch

# To build only
npm run build

# Start the Electron app
npm run start
```

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section.

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
