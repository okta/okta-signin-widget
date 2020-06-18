These steps can only be done by on the Okta internal network.

Since the SIW repo is open-source you have probably moved your Okta `.npmrc` file somewhere. 
Copy that file to this directory, since we need to access the Okta private repository.

Before proceeding make sure you have promoted idx-js master run from bacon as per https://github.com/okta/okta-idx-js/pull/19
Also make sure your npm rc file is not pointing to okta registry. This is most likely because promoted artifacts are under npm-release/@okta/okta-idx-js instead of npm-okta/okta-idx-js
https://artifacts.aue1d.saasure.com/artifactory/webapp/#/artifacts/browse/tree/General/npm-release/@okta/okta-idx-js/


1: Update package json to bump version : `yarn upgrade @okta/okta-idx-js@0.2.1-beta.g3565b17`
2: Run `yarn build`