These steps can only be done by on the Okta internal network.

Since the SIW repo is open-source you have probably moved your Okta `.npmrc` file somewhere. 
Copy that file to this directory, since we need to access the Okta private repository.

1: Update package json to bump version : `yarn upgrade @okta/okta-idx-js@0.2.1-beta.g3565b17`
2: Run `yarn build`