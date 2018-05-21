COURAGE
=======
<img align="right" src="docs/img/ico_courage_64.png?raw=true" />

* [Getting started](#getting-started)
* [Development workflow](#development-workflow)
  * [Developing a feature in both okta-core and courage](#developing-a-feature-in-both-okta-core-and-courage)
* [Publishing and consuming your changes](#publishing-and-consuming-your-changes)
  * [Publish your new courage version](#publish-your-new-courage-version)
  * [Install that new version in the project you're working on](#install-that-new-version-in-the-project-youre-working-on)
* [Courage Playground](#courage-playground)
* [Useful commands](#useful-commands)

<a id="getting-started"></a>
# Getting started

Setting up courage is easy:

1. Navigate to your **$OKTA_HOME** directory
    ```bash
    [~]$ cd $OKTA_HOME
    ```

2. Clone this repo
    ```bash
    [okta]$ git clone git@github.com:okta/courage.git
    ```
3. Make sure you are on the right node version - node 8.1.1.

4. Run a [yarn install](https://yarnpkg.com/en/docs/cli/install)
    ```bash
    [okta/courage]$ yarn install
    ```
_[install yarn](https://yarnpkg.com/en/docs/install) if it's not available in your system yet_

<a id="development-workflow"></a>
# Development workflow

**Note:** The [UICore team](https://oktawiki.atlassian.net/wiki/display/eng/UI+Core) is working on a more generic solution to this that will span across modules.

<a id="developing-a-feature-in-both-okta-core-and-courage"></a>
### Developing a feature in both okta-core and courage

If you're working with the [admin](https://github.com/okta/okta-core/tree/master/clients/admin) or [enduser](https://github.com/okta/okta-core/tree/master/clients/enduser) okta-core projects, use the `grunt link` command:
```bash
# Links your current courage changes to okta-core/clients/admin
[okta/courage]$ grunt link --admin

# Links your current courage changes to okta-core/clients/enduser
[okta/courage]$ grunt link --enduser

# Links to both enduser and admin
[okta/courage]$ grunt link
```

**Note:** If you're getting a permissions error when running this command:

First, make sure that your npm path is NOT '/usr' by running the following command:
```bash
npm config get prefix
```
If your npm config prefix is '/usr', go to "Option 2" in [getting started docs](https://docs.npmjs.com/getting-started/fixing-npm-permissions)

If/When the path is correctly set, run the following command:
```bash
$ sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

More information in NPM's [getting started docs](https://docs.npmjs.com/getting-started/fixing-npm-permissions).


The `grunt link` command does a couple things:

1. Runs a [yarn link](https://yarnpkg.com/en/docs/cli/link) for the given project, which effectively symlinks the @okta/courage module to the checked out courage repo.

  > For example, running `grunt link --admin` creates a symlink from *admin/node_modules/@okta/courage* to the *okta/courage* directory.

2. [Watches](https://github.com/gruntjs/grunt-contrib-watch) for any changes to courage - both [sass](https://github.com/okta/courage/tree/master/assets/sass) and [js](https://github.com/okta/courage/tree/master/src). Changes trigger the **copy:courage** grunt targets for the given project.

  > In the previous **admin** example, this watch ensures that any change to a file in the local courage directory gets copied to *okta-core/clients/admin/target*.

3. Cleans up the links when the watch exits (**ctrl+c**). This includes both a `yarn unlink` (deletes the symlink) and a `yarn install` (retrieves the original @okta/courage module that's specified in the target package.json file).

This means that when running this command, **any change to courage gets deployed to the target/ folders in okta-core**.

In *okta-core*, you can use whichever flows you're normally used to. Note that there are no longer any "deploy.modified.shared" commands - they are no longer necessary.

#### Examples

##### Scenario 1: ant deploy.modified.ui targets
- Run `[okta/courage]$ grunt watch --admin`
- Make a change to courage
- Wait for watch to copy files over (usually a second or so)
- Run `[okta/okta-core]$ ant deploy.modified.ui.admin`

##### Scenario 2: ant watch.ui
- Run `[okta/courage]$ grunt watch --admin`
- Run `[okta/okta-core]$ ant watch.ui`
- Make a change to courage
- Wait for courage watch to copy files over to the admin target dir
- Wait for okta-core watch to copy to **$TOMCAT_HOME**

<a id="publishing-and-consuming-your-changes"></a>
# Publishing and consuming your changes

You're done developing the courage component of your feature - now what? There are two main phases to getting your commits in:

<a id="publish-your-new-courage-version"></a>
### 1. Publish your new courage version

1. Push your topic courage branch to github
2. Create a PR, and get it signed off
3. Go to the [courage bacon dashboard](http://bacon.trex.saasure.com/#!/commits/courage)
4. When everything has passed, and you've gotten a :rocket:, click the **merge** button
5. Once the **master** commit has merged and passed bacon, run the following command in your topic branch to find the published version:

    ```bash
    # Finds the published beta prerelease version
    [okta/courage]$ grunt get-published-version
    ```

<a id="install-that-new-version-in-the-project-youre-working-on"></a>
### 2. Install that new version in the project you're working on

1. **Important** Make sure that `grunt link` is no longer running. When you exit the link command, the symlinks are deleted and a `yarn install` re-installs the original @okta/courage version. You can verify that @okta/courage is no longer a symlink by running `ls -ld`:

  ```bash
  # Verify that this yields a directory, i.e. drwxr-xr-x, not lrwxr-xr-x
  [clients/admin]$ ls -ld node_modules/\@okta/courage
  ```

2. Install the package with your new version number

  Note: Examples below use version number is _1.1.0-beta.20_, replace that number with your new version

  - If you're updating *okta-core*, run the following command:

      ```bash
      [okta-core/]$ ant yarn.upgrade.courage -Dver=1.1.0-beta.20
      ```

  - If you're updating a repo that uses yarn:
      ```bash
      [your-module]$ yarn upgrade @okta/courage@1.1.0-beta.20
      ```

  - If you're updating another repo that does not use yarn, use `npm install`:

      ```bash
      [your-module]$ npm install -E @okta/courage@1.1.0-beta.20 --save
      ```

3. You're done! Well, almost. You'll need to commit this okta-core change.

<a id="courage-playground"></a>
# Playground / Courage only development

Use the playground to learn about and try the courage framework, and to iterate on local courage development.

```bash
# Starts the playground server on port 3000 and opens the browser
[okta/courage]$ grunt play

# Specify a different port with the --port option
[okta/courage]$ grunt play --port=1337
```

### SCSS changes
If the changes are in scss files they have to be copied to okta-core/clients/admin using grunt link or grunt watch and
similarly okta-core/clients/admin needs to be rebuilt using ant deploy.modified.ui.admin or ant watch.ui. This is
because okta.scss imports scss files from courage and okta-core/clients/admin. This painful process is required until
we have an okta-core dependency.

grunt play would now load the new css
<a id="useful-commands"></a>
# Useful commands

Command        | Description
-------------- | --------------
**yarn lint** | Runs *scss-lint*, *jshint*, and *eslint*
**yarn test** | Runs the jasmine unit tests in the cli.
**yarn test -- --br** | Runs the jasmine unit tests in the browser
**yarn start** | Start the playground server to run on port 3000 by default. Load a url in browser with the specified port to use the playground, ex. localhost:3000.
**yarn test:e2e** | Runs end-2-end selenium tests.
**yarn test:e2e -- --specs test/selenium/spec/NAME.js** | Runs single end-2-end selenium test
**grunt link** | Links the current courage module to *enduser* or *admin*. Use **--enduser** or **--admin** for more specificity
