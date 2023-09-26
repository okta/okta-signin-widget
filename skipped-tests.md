# Skipped fixtures and tests for Gen3

## Skipped fixtures (fixture name)
* Device Challenge Polling View for Chrome DTC

Fixtures skipped: 1 (4 tests)

## Skipped tests (test name, fixture name)
* no polling if session has expired, Challenge Email Authenticator Form
* resend after at most 30 seconds even after re-render, Challenge Email Authenticator Form
* SMS primary mode - shows nickname when present in API response, Challenge Phone Form
* in loopback server, redundant polling exists if server returns enhancedPollingEnabled as false, Device Challenge Polling View for user verification and MFA with the Loopback Server, Custom URI and Universal Link approaches
* in loopback server, no redundant polling if server returns enhancedPollingEnabled as true, Device Challenge Polling View for user verification and MFA with the Loopback Server, Custom URI and Universal Link approaches
* challenge ov push screen has right labels and a checkbox, Challenge Okta Verify Push
* should be able to see OV same device enrollment instructions without polling, Enroll Okta Verify Authenticator
* should be able to see OV device bootstrap enrollment instructions without polling with one device, Enroll Okta Verify Authenticator
* should be able to see OV device bootstrap enrollment instructions without polling with multiple devices, Enroll Okta Verify Authenticator
* Callout appears after 30 seconds at most even after re-render, Authenticator Enroll Phone
* should be able to submit identifier with rememberMe, Identify
* should show error if server response is unsupported, Identify
* should show global error for invalid user, Identify
* should transform identifier using settings.transformUsername, Identify
* should compute device fingerprint and add to header, Identify
* should continue to compute device fingerprint and add to header when there are API errors, Identify
* should "autoFocus" form with config or by default, Identify
* should show errors after empty required fields are focused out, Registration
* should not have password toggle if "features.showPasswordToggleOnSignInPage" is false, Identify + Password
* should store identifier in ln cookie when updated, Identify With Remember Username
* clears recovery_token and does not pass it to interact after clicking "back to signin", Interact
* Calls resend when we click the resend link from within the warning modal, Number Challenge Okta Verify Push
* Should have the correct labels, Authenticator Expired Password
* Should have the correct labels, Authenticator Expired Password
* can choose "skip" if password change is not allowed, Password Authenticator Expiry Warning
* should load select authenticator list with nicknames if available, Select Authenticator for verification Form
* should navigate to okta verify fast pass page, Select Authenticator for verification Form
* should navigate to on prem mfa challenge page, Select Authenticator for verification Form
* should navigate to RSA challenge page, Select Authenticator for verification Form
* should navigate to Duo challenge page, Select Authenticator for verification Form
* should navigate to Custom OTP challenge page, Select Authenticator for verification Form
* should navigate to Custom App challenge page, Select Authenticator for verification Form
* should show the correct error message when the unlock account form is submitted via keyboard with no authenticator selected (1 authenticator available), Unlock Account
* should show the correct error message when the unlock account form is submitted via keyboard with no authenticator selected (multiple authenticator available), Unlock Account
* should hide user's identifier if feature is disabled, Custom widget attributes

Tests skipped: 35

Total tests skipped: 39
