module.exports = {
  path: '/challenge',
  method: 'POST',
  status: (req, res, next) => {
    if(req.query.foo === '6512') {
      res.status(200);
      next();
    }
  },
  render: (req, res) => {
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.append('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.send();
  }
};
