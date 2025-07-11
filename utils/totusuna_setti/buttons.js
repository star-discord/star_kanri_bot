const inputBody = require('./buttons/input_body');
const reportButton = require('./buttons/reportButton');
const deleteButton = require('./buttons/delete');
const resendButton = require('./buttons/再送信');
const deleteTextButton = require('./buttons/本文削除');
const editButton = require('./buttons/編集');
const editSettingButton = require('./buttons/設定を編集');
const submitSettingButton = require('./buttons/設置する');

module.exports = {
  [inputBody.customId]: async (interaction, ...args) => inputBody.handle(interaction, ...args),
  [reportButton.customId]: async (interaction, ...args) => reportButton.handle(interaction, ...args),
  [deleteButton.customId]: async (interaction, ...args) => deleteButton.handle(interaction, ...args),
  [resendButton.customId]: async (interaction, ...args) => resendButton.handle(interaction, ...args),
  [deleteTextButton.customId]: async (interaction, ...args) => deleteTextButton.handle(interaction, ...args),
  [editButton.customId]: async (interaction, ...args) => editButton.handle(interaction, ...args),
  [editSettingButton.customId]: async (interaction, ...args) => editSettingButton.handle(interaction, ...args),
  [submitSettingButton.customId]: async (interaction, ...args) => submitSettingButton.handle(interaction, ...args),
};
