# Okta Sign-In Widget

For a comprehensive guide to using the widget, read the docs on the [Okta Sign-In Widget developer page](http://developer.okta.com/docs/guides/okta_sign-in_widget.html).

## Including the widget with NPM



## Building the widget

1. Clone this repo
  ```bash
  [path]$ git clone git@github.com:okta/okta-signin-widget.git
  ```

2. Navigate to the new okta-signin-widget folder, and [install Bundler](http://bundler.io/) if you don't already have it:

  ```bash
  [path/okta-signin-widget]$ gem install bundler
  ```

3. Install our ruby dependencies:

  ```bash
  [path/okta-signin-widget]$ bundle install
  ```

4. Install our node dependencies:

  ```bash
  [path/okta-signin-widget]$ npm install
  ```

5. Create a `.widgetrc` file in the okta-signin-widget/ directory. For now, just add this to it:

  ```javascript
    {
      "widgetOptions": {
        "baseUrl": "https://<your-org>.okta.com"
      }
    }
  ```

6. Run this command to build the widget, start a local connect server that hosts it, and launch a browser window with the widget running!

  ```bash
  [path/okta-signin-widget]$ npm start
  ```

7. Finally, enable CORS support for our new server by [following these instructions](http://developer.okta.com/docs/guides/okta_sign-in_widget.html#configuring-cors-support-on-your-okta-organization). You can now authenticate to Okta using your very own, customizable widget!

## The .widgetrc config file

The `.widgetrc` file is a configuration file that saves your local widget settings.

| property | description |
| --- | --- |
| **widgetOptions** | Options that are passed to the widget on initialization - reference the [developer docs](http://developer.okta.com/docs/guides/okta_sign-in_widget.html#customizing-widget-features-and-text-labels-with-javascript) to see a complete list of configurable features. |
| **serverPort** | The port the local server runs on. Defaults to *1804* |

## Build and test commmands

| property | description |
| --- | --- |
| `npm start` | Build the widget, start the server, and open a browser window with the widget loaded |
| `npm run build:dev` | Build an unminified version of the widget |
| `npm run build:prod` | Build a minified, uglified version of the widget |
| `npm test` | Run unit tests |
| `npm run lint` | Run jshint and scss linting tests |
