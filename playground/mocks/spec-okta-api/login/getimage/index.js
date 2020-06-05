const data = [
  {
    imageDescription: 'Security Image - Road',
    pwdImg: 'https://tc1static.oktacdn.com/assets/img/security/road.jpg',
    result: 'success',
  }
];

module.exports = {
  path: '/login/getimage',
  proxy: false,
  method: 'GET',
  template: data[0],
};
