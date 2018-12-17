# @okta/courage-for-signin-widget

Generates a custom version of Courage for the Sign-In Widget.
It's intend for internal developers and please open a ticket if any questions.

## Steps

0. Make sure VPN is connected
1. Upgrade courage version. e.g. `yarn upgrade @okta/courage@4.4.0`
2. Run `yarn build`
3. Commit any changes in folder `../courage-dist/`.
   Those files will have changes only if the relevant components of courage that we consume in the Sign-In Widget have changed.
