// utils/totusuna_setti/modals/index.js

const path = require('path');
const { loadHandlers } = require('../../handlerLoader');

const modalsDir = path.join(__dirname); // このディレクトリ（modals）自身
const findHandler = loadHandlers(modalsDir);

module.exports = findHandler;
