define({
  "status": 200,
  "responseType": "json",
  "response": {
    "issuer": "https://foo.com/oauth2/aus8aus76q8iphupD0h7",
    "authorization_endpoint": "https://foo.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize",
    "token_endpoint": "https://foo.com/oauth2/aus8aus76q8iphupD0h7/v1/token",
    "jwks_uri": "https://foo.com/oauth2/aus8aus76q8iphupD0h7/v1/keys",
    "response_types_supported": [
      "code",
      "token",
      "code token"
    ],
    "response_modes_supported": [
      "query",
      "fragment",
      "form_post",
      "okta_post_message"
    ],
    "grant_types_supported": [
      "authorization_code",
      "implicit",
      "refresh_token",
      "password"
    ],
    "subject_types_supported": [
      "public"
    ],
    "scopes_supported": [
      "offline_access"
    ],
    "token_endpoint_auth_methods_supported": [
      "client_secret_basic",
      "client_secret_post",
      "none"
    ],
    "code_challenge_methods_supported": [
      "S256"
    ],
    "introspection_endpoint": "https://foo.com/oauth2/aus8aus76q8iphupD0h7/v1/introspect",
    "introspection_endpoint_auth_methods_supported": [
      "client_secret_basic",
      "client_secret_post",
      "none"
    ],
    "revocation_endpoint": "https://foo.com/oauth2/aus8aus76q8iphupD0h7/v1/revoke",
    "revocation_endpoint_auth_methods_supported": [
      "client_secret_basic",
      "client_secret_post",
      "none"
    ]
  }
});
