const path = require('path');
const { loadHandlers } = require('../../handlerLoader');

const findHandler = loadHandlers(path.join(__dirname, 'selects'));

module.exports = findHandler;
