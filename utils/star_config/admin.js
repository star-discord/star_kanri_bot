// utils/star_config/checkAdmin.js
const isAdmin = require('./admin');
const { createAdminRejectEmbed } = require('../embedHelper');

/**
 * 管理者チェックを行い、NGならEmbedでリプライ（true: OK, false: 拒否済）
 * @param {import('discord.js').CommandInteraction} interaction
 * @returns {Promise<boolean>}
 */
async function checkAdmin(interaction) {
  if (isAdmin(interaction)) return true;

  await interaction.reply({
    embeds: [createAdminRejectEmbed()],
    ephemeral: true
  });
  return false;
}

module.exports = checkAdmin;
