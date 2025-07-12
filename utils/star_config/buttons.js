// utils/star_config/buttons.js
const path = require('path');
const { loadHandlers } = require('../handlerLoader');

const findHandler = loadHandlers(path.join(__dirname, 'buttons'));

module.exports = findHandler;
