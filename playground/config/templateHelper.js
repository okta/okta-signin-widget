const  responseConfig =  require('./responseConfig');
const getTemplatePath = (path, index) => {
  console.log(index);
  if (responseConfig.mocks[path]) {
    if (index >= responseConfig.mocks[path].length) {
      index = 0;
    }
    const fileName = responseConfig.mocks[path][index];
    const filePath = './data/' + fileName + '.json';
    return filePath;
  }
};

module.exports = { getTemplatePath };