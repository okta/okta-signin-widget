const DEFAULT = {
  imageDescription: 'Security Image - Road',
  pwdImg: '/img/security/road.jpg',
  result: 'success'
};

const UNKNOWN_USER = {
  imageDescription: 'Security Image - Unknown',
  pwdImg: '/img/security/unknown.png',
  result: 'success'
};

const NEW_USER = {
  imageDescription: 'Security Image - New User',
  pwdImg: '/img/security/unknown-device.png',
  result: 'success'
};

module.exports = {
  path: '/login/getimage',
  proxy: false,
  method: 'GET',
  template(params, query) {
    let obj;

    // For playground users, show different images based on a username
    switch (query.username) {
    case 'unknown':
      obj = UNKNOWN_USER;
      break;
    case 'new':
      obj = NEW_USER;
      break;
    default:
      obj = DEFAULT;
    }
    return obj;
  }
};
