module.exports = {
  path: '/asyncLink/factorEnrollment',
  proxy: false,
  method: 'OPTIONS',
  status: (req, res, next) => {
    const portNumber = req.params.port;
    switch(portNumber) {
    case '41236':
      res.status(400);
      break;
    case '41238':
      res.status(401);
      break;
    case '41240':
      res.status(403);
      break;
    case '41242':
      res.status(406);
      break;
    case '41244':
    default:
      res.status(200);
    }
    next();
  },
};
