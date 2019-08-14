// Uncomment for Jintai:
// const data = {
// eslint-disable-next-line max-len
//   jwt: <todo: add challenge response jwt>
// };

// Uncomment for Lars:
const data = {
  // eslint-disable-next-line max-len
  jwt: 'eyJraWQiOiIwdHIwYjJlcGEyZXV6andzNDgzeCIsImFsZyI6IlJTMjU2In0.eyJkZXZpY2VFbnJvbGxtZW50SWQiOiJkZW50MjNublB2NUhkeWVMdTBnMyIsIm5vbmNlIjoiPGZpbGxJbj4iLCJqd2siOiJ7XCJrdHlcIjpcIlJTQVwiLFwiZVwiOlwiQVFBQlwiLFwia2lkXCI6XCJheHl5OWZuMTdiaDBqZHZoaTRrMFwiLFwiblwiOlwianN1T0g1MmVTT1Z3T2QwODg5WGVWamx2WFVoaGxiT1J6ekZVckItTlRLU3NZYVhsbUlKaFNNeDQybFo0MDVWbldER0NXS2NyX2k0TktmLUZXM0szTnN6TnlaREMyaEVWWWhyWXYwcGFONi1ZSmJSWXRHNWR0bV9mVXF0dnhUYzl0cTI3RTJ0d2VHSDVtWnd3U2VlTnlaOUk5TW5XSDNOWFZ5WFp0TWpWNmN0RVIyUVplRWpFMTZLWmtSQmFuVnZ0by1FWDhVeGdNVGFDTUxsR2FFWmJWVmJiRXlsTmVBT2dxZ1BHc05XS1doNG5KNERlcjFBME1SQjAtYU12TGdvdHZQWmhSNllrRjg2c3NjTzlEcGNHOUlUNXhFUHJvc2o2ZThBMF8zOWYyZlR3WU9LWmRxUmY3UnM0TzVGOWJ0c0tNVVdRTWxubklqa1JSc3pNM0cxeHB3XCJ9In0.XKBGXrFxPQ4PuWdVXBSF1VVPgQxCIFgW_t5mSgtpQFHSgO0_19F9POOJzwdcC21eLTUsBVzkjbkEodYmTQwGDHZ1zdeHio7tYthth7GAZOlwtBTPoQpFLGUnkSvjxvEHdJqsGSssjPMrJmc1766qDnjWkmefA-jgi-NMML8CugfVTLPeajLhX1UJK4-DqECIq_uGsvwonKSNy1ltinL4PLZ6h7RnwbpjJw1w8ARdHwGeC75aZyuQTv5xxi1vMih7ZSBt7ossE6GpONspr5UXYL5aUPO0ihrCpfwxF1XnZ1ndkFcLabdw934_0PuEkq1K44Z6a_S3pUyWkOT1j37qSg',
}

module.exports = {
  path: '/loopback/factorEnrollChallenge/:port',
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
