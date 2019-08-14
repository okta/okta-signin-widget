// Uncomment for Jintai:
// const data = {
// eslint-disable-next-line max-len
//   jwt: <todo: add challenge response jwt>
// };

// Uncomment for Lars:
const data = {
  // eslint-disable-next-line max-len
  jwt: 'eyJraWQiOiJheHl5OWZuMTdiaDBqZHZoaTRrMCIsImFsZyI6IlJTMjU2In0.eyJub25jZSI6IjxmaWxsSW4-In0.dvYx1rmAkQ5QgSsp4XJRLmi9Mdcw99BRozRu9umIjFHm0rB3Jt0tDd6SlrG6qDyPEMWvbQGHG5OBwRQugQA9R_4gLntT45lvyQNhUEAWK1B8GGvlnWWTTS7vDc2vBElh3yCxcGfLzohojfjNXO6KJx4_J3d19LfbnEDLh3TGaYp5fKvnjKx_GE0WqY2oTVzHPeUXlGDcD7g8vHkmvArhg-8We4YgARX3fd9XpMtf0Z2-CsY-yQeRErpJNfv1OVZXghWX4OSnXrHYrJm5Xlvp8jiTvCfF9FjkPOdFt-qSu9f8nqk0sgs-zInZ8RvPLXel0bTW6w5oMZV7Wt0BzmGBYQ',
}

module.exports = {
  path: '/loopback/factorVerifyChallenge/:port',
  proxy: false,
  method: 'POST',
  template: (params, query, body, cookies, headers) => {
    if (params.port === '5008') {
      return data;
    }
  },
  status: (req, res, next) => {
    const portNumber = req.params.port;
    switch(portNumber) {
    case '5000':
      res.status(400);
      break;
    case '5002':
      res.status(401);
      break;
    case '5004':
      res.status(403);
      break;
    case '5006':
      res.status(406);
      break;
    case '5008':
    default:
      res.status(200);
    }
    next();
  },
};
