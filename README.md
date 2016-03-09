# Okta Sign-In Widget

The Okta Sign-In Widget is a JavaScript widget from Okta that gives you a fully featured and customizable login experience which can be used to authenticate users on any web site.

If you want to use the widget, see the instructions on [the Okta Sign-In Widget developer page](http://developer.okta.com/docs/guides/okta_sign-in_widget.html).

If you want to modify the widget, use the following instructions.

<!-- ## Including the widget with NPM -->
<!-- Content for this section to be added later. -->

## Building the widget

1. Clone the widget repo.
  ```bash
  [path]$ git clone git@github.com:okta/okta-signin-widget.git
  ```

2. Navigate to the new ```okta-signin-widget``` folder, and [install Bundler](http://bundler.io/) if you don't already have it.

  ```bash
  [path/okta-signin-widget]$ gem install bundler
  ```

3. Install our Ruby dependencies.

  ```bash
  [path/okta-signin-widget]$ bundle install
  ```

4. Install the Okta node dependencies.

  ```bash
  [path/okta-signin-widget]$ npm install
  ```

5. Create a `.widgetrc` file in the ```okta-signin-widget/``` directory. Add a base URL entry in `.widgetrc`.

  ```javascript
    {
      "widgetOptions": {
        "baseUrl": "https://your-org.okta.com"
      }
    }
  ```

6. Build the widget, start a local connect server that hosts it, and launch a browser window with the widget running.

  ```bash
  [path/okta-signin-widget]$ npm start
  ```

7. Finally, enable CORS support for our new server by [following these instructions](http://developer.okta.com/docs/guides/okta_sign-in_widget.html#configuring-cors-support-on-your-okta-organization). You can now authenticate to Okta using your very own, customizable widget!

## The `.widgetrc` config file

The `.widgetrc` file is a configuration file that saves your local widget settings.

| Property | Description |
| --- | --- |
| **widgetOptions** | Options that are passed to the widget on initialization - reference the [developer docs](http://developer.okta.com/docs/guides/okta_sign-in_widget.html#customizing-widget-features-and-text-labels-with-javascript) to see a complete list of configurable features. |
| **serverPort** | The port the local server runs on. Defaults to *1804* |

## Build and test commmands

| Command | Description |
| --- | --- |
| `npm start` | Build the widget, start the server, and open a browser window with the widget loaded |
| `npm run build:dev` | Build an unminified version of the widget |
| `npm run build:prod` | Build a minified, uglified version of the widget |
| `npm test` | Run unit tests |
| `npm run lint` | Run jshint and scss linting tests |
