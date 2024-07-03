# Cordova Spotify OAuth Plugin

Easy Spotify authentication for [Apache Cordova][cordova] / PhoneGap apps

This repo is a fork of [Festify/cordova-spotify-oauth](https://github.com/Festify/cordova-spotify-oauth)

[API Documentation][api-docs]

## Changes

1. Bumped Spotify Android SDK Version to [2.1.0](https://github.com/spotify/android-sdk/releases/tag/v0.8.0-appremote_v2.1.0-auth)
2. Updated Android version requirements (Min: 26, Target: 34) for Android 13 support
3. Updated Android error handler to return proper ERROR CODE
4. Updated server side with latest Spotify Web API specs

## Features

This plugin provides a simple way of authenticating a user with the Spotify API using the authorization code flow.

The plugin uses `SFSafariViewController` and Chrome Custom Tabs, if available. This also means it will only work on iOS 9 and above (but this shouldn't be a problem anymore).

## Examples

The plugin consists of two functions clobbered onto `cordova.plugins.spotifyAuth`.

### Log in

```js
const config = {
  clientId: "<SPOTIFY CLIENT ID>",
  redirectUrl: "<REDIRECT URL, MUST MATCH WITH AUTH ENDPOINT AND SPOTIFY DEV CONSOLE>",
  scopes: ["streaming"], // see Spotify Dev console for all scopes
  tokenExchangeUrl: "<URL OF TOKEN EXCHANGE HTTP ENDPOINT>",
  tokenRefreshUrl: "<URL OF TOKEN REFRESH HTTP ENDPOINT>",
};

cordova.plugins.spotifyAuth.authorize(config)
  .then(({ accessToken, expiresAt }) => {
    console.log(`Got an access token, its ${accessToken}!`);
    console.log(`Its going to expire in ${expiresAt - Date.now()}ms.`);
  });
```

### Log out

```js
cordova.plugins.spotifyAuth.forget();
```

## Installation

```bash
cordova plugin add cordova-spotify-oauth2
```

## Usage

The plugin implements the [OAuth Authorization Code][auth-code-flow] flow for the Spotify API. This allows you to obtain access and refresh tokens for user related-actions (such as viewing and modifying their library, streaming tracks via the SDKs, etc.). Therefore, additional preparation in addition to installing the plugin is required.

### Protocol registration

The plugin uses custom URL schemes (universal links support will follow) to redirect back from the browser into the app.

You need to register the callback protocol inside the `App Info.plist` so that iOS knows which app to start when it is redirected when the authentication is done. If you want to use Chrome Custom Tabs (optional, but 110% nice), you must also register the URL scheme and path you will be redirected to within the `AndroidManifest.xml` file.

Take a look at [this repository][cordova-scheme-helper] to see how it's done for both cases.

### Spotify Developer Registration

You need to register your custom redirect URL within the Spotify Developer console. Make sure you register the _exact_ value you use within your code (including trailing slashes, etc.).

### Token Exchange Service

The authorization code flow requires server code for security. These come in the form of two HTTP endpoints, one for the auth code exchange, and the other one for access token refresh. The SDK will POST `application/x-www-form-urlencoded` data and expects JSON back. Ensure you have proper CORS config set up.

To easily implement them, we built a [Serverless] service for [AWS Lambda][aws-lambda] over in the [`oauth-token-api`][token-api-example] folder. Make sure you [install the Serverless Framework properly][serverless-installation]!
To resolve the project dependencies, please use [yarn][yarn-install] as shown below before deploying the service.

For the execution of the functions to work you need to set some environmental configuration in the file `oauth-token-api/.env`

```bash
CLIENT_ID="<Your Spotify Client ID>"
CLIENT_SECRET="<Your Spotify Client Secret>"
CLIENT_CALLBACK_URL="<The callback url of your app>" # e.g. "festify-spotify://callback"
ENCRYPTION_SECRET="<Secret used to encrypt the refresh token - please generate>"
```

You can then deploy the functions like this:

```bash
cd oauth-token-api
yarn install
serverless deploy
```

The `serverless` CLI will then print the URL where the functions can be reached. These are the values needed for [`tokenExchangeUrl`][token-exchange-url] and [`tokenRefreshUrl`][token-refresh-url].

### JavaScript usage

Head over to the [API Documentation][api-docs].

## Contributing

Pull requests are very welcome! Please use the [gitmoji] style for commit messages.

[api-docs]: https://festify.github.io/cordova-spotify-oauth/
[auth-code-flow]: https://developer.spotify.com/web-api/authorization-guide/#authorization-code-flow
[aws-lambda]: https://aws.amazon.com/lambda/
[cordova]: https://cordova.apache.org/
[cordova-scheme-helper]: https://github.com/Festify/festify-cordova-scheme-helper
[gitmoji]: https://gitmoji.carloscuesta.me/
[serverless]: https://serverless.com
[serverless-installation]: https://serverless.com/framework/docs/providers/aws/guide/installation/
[token-api-example]: https://github.com/Festify/cordova-spotify-oauth/tree/develop/oauth-token-api
[token-exchange-url]: https://festify.github.io/cordova-spotify-oauth/interfaces/config.html#tokenexchangeurl
[token-refresh-url]: https://festify.github.io/cordova-spotify-oauth/interfaces/config.html#tokenrefreshurl
[yarn-install]: https://yarnpkg.com/en/docs/install
