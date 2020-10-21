/* eslint-disable no-unused-vars */
function addMessageToPage (id, msg) {
  var appNode = document.createElement('div');
  appNode.setAttribute('id', id);
  appNode.innerHTML = msg;
  document.body.appendChild(appNode);
}

function addTokensToPage (tokens) {
  var idToken = tokens.idToken;
  if (idToken) {
    addMessageToPage('idtoken_user', idToken.claims.name);
  }
}
