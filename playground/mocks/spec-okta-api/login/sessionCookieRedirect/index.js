module.exports = {
  path: '/login/sessionCookieRedirect',
  proxy: false,
  method: 'GET',
  status: (req, res, next) => {
    res.status(302);
    next();
  },
  render: (req, res) => {
    const redirectUrl = req.query.redirectUrl;
    res.append('Location', redirectUrl);
    res.send(res.body);
  },
};
