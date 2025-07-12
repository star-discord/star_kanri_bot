// 繝輔ぃ繧､繝ｫ蜿ら・: utils/kpi_setti/stepChatHandler.js

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { validateDate, isHalfWidthNumber } = require('./utils');
const { saveKpiTarget, saveKpiReport, formatProgressLog } = require('./step/kpiDataHandler');

// 繝ｦ繝ｼ繧ｶ繝ｼID繧偵く繝ｼ縺ｫ縺励※騾ｲ陦御ｸｭ繧ｻ繝・す繝ｧ繝ｳ繧堤ｮ｡逅・const activeReportSessions = new Map();

/**
 * 繧ｹ繝・ャ繝励メ繝｣繝・ヨ縺ｮ繝｡繝・そ繝ｼ繧ｸ蜃ｦ逅・ * @param {import('discord.js').Message} message
 */
async function handleStepChatMessage(message) {
  const userId = message.author.id;
  if (!activeReportSessions.has(userId)) return;

  const session = activeReportSessions.get(userId);
  const content = message.content.trim();

  // 蜊願ｧ呈焚蟄励・繧ｹ繝ｩ繝・す繝･繝ｻ繝上う繝輔Φ遲峨・讀懆ｨｼ繝ｦ繝ｼ繝・ぅ繝ｪ繝・ぅ繧剃ｽｿ逕ｨ
  // session.type: 'target' 縺ｾ縺溘・ 'report'

  if (session.type === 'target') {
    await handleTargetStep(message, session, content);
  } else if (session.type === 'report') {
    await handleReportStep(message, session, content);
  }
}

/**
 * KPI逶ｮ讓吝・蜉帙せ繝・ャ繝怜・逅・ */
async function handleTargetStep(message, session, content) {
  try {
    switch (session.step) {
      case 0:
        if (!validateDate(content)) {
          await message.reply('笶・譛滄俣髢句ｧ区律縺ｯ縲刑YYY/MM/DD縲榊ｽ｢蠑上〒豁｣縺励￥蜈･蜉帙＠縺ｦ縺上□縺輔＞縲ゆｾ・ 2025/07/13');
          return;
        }
        session.data.startDate = content;
        session.step++;
        await message.reply('邨ゆｺ・律繧偵刑YYY/MM/DD縲阪・蠖｢蠑上〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
        break;

      case 1:
        if (!validateDate(content)) {
          await message.reply('笶・譛滄俣邨ゆｺ・律縺ｯ縲刑YYY/MM/DD縲榊ｽ｢蠑上〒豁｣縺励￥蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.endDate = content;
        session.step++;
        await message.reply('譚･螳｢謨ｰ逶ｮ讓吶ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞・域焚蟄励・縺ｿ・峨・);
        break;

      case 2:
        if (!isHalfWidthNumber(content)) {
          await message.reply('笶・譚･螳｢謨ｰ逶ｮ讓吶・蜊願ｧ呈焚蟄励〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.visitors = Number(content);
        session.step++;
        await message.reply('謖・錐譛ｬ謨ｰ逶ｮ讓吶ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞・域焚蟄励・縺ｿ・峨・);
        break;

      case 3:
        if (!isHalfWidthNumber(content)) {
          await message.reply('笶・謖・錐譛ｬ謨ｰ逶ｮ讓吶・蜊願ｧ呈焚蟄励〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.shimei_count = Number(content);
        session.step++;
        await message.reply('謖・錐螢ｲ荳顔岼讓吶ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞・域焚蟄励・縺ｿ・峨・);
        break;

      case 4:
        if (!isHalfWidthNumber(content)) {
          await message.reply('笶・謖・錐螢ｲ荳顔岼讓吶・蜊願ｧ呈焚蟄励〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.shimei_sales = Number(content);
        session.step++;
        await message.reply('繝輔Μ繝ｼ螢ｲ荳顔岼讓吶ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞・域焚蟄励・縺ｿ・峨・);
        break;

      case 5:
        if (!isHalfWidthNumber(content)) {
          await message.reply('笶・繝輔Μ繝ｼ螢ｲ荳顔岼讓吶・蜊願ｧ呈焚蟄励〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.free_sales = Number(content);
        session.step++;
        await message.reply('邏泌｣ｲ荳顔岼讓吶ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞・域焚蟄励・縺ｿ・峨・);
        break;

      case 6:
        if (!isHalfWidthNumber(content)) {
          await message.reply('笶・邏泌｣ｲ荳顔岼讓吶・蜊願ｧ呈焚蟄励〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.total_sales = Number(content);

        // 菫晏ｭ伜・逅・        await saveKpiTarget(message.guildId, session.data);

        // 螳御ｺ・Γ繝・そ繝ｼ繧ｸ・区ｬ｡縺ｮ謫堺ｽ懊・繧ｿ繝ｳ陦ｨ遉ｺ
        await message.channel.send('笨・KPI逶ｮ讓吶′菫晏ｭ倥＆繧後∪縺励◆縲・);

        await sendKpiStartButtons(message.channel);

        activeReportSessions.delete(message.author.id);
        break;

      default:
        await message.reply('笶・荳肴・縺ｪ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・);
        activeReportSessions.delete(message.author.id);
        break;
    }
  } catch (err) {
    console.error('KPI逶ｮ讓吝・蜉帛・逅・お繝ｩ繝ｼ:', err);
    await message.reply('笶・KPI逶ｮ讓吶・菫晏ｭ倅ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・);
    activeReportSessions.delete(message.author.id);
  }
}

/**
 * KPI螳溽ｸｾ逕ｳ隲句・蜉帙せ繝・ャ繝怜・逅・ */
async function handleReportStep(message, session, content) {
  try {
    switch (session.step) {
      case 0:
        if (!validateDate(content)) {
          await message.reply('笶・逕ｳ隲区律莉倥・縲刑YYY/MM/DD縲榊ｽ｢蠑上〒豁｣縺励￥蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.date = content;
        session.step++;
        await message.reply('譚･螳｢謨ｰ繧貞・蜉帙＠縺ｦ縺上□縺輔＞・域焚蟄励・縺ｿ・峨・);
        break;

      case 1:
        if (!isHalfWidthNumber(content)) {
          await message.reply('笶・譚･螳｢謨ｰ縺ｯ蜊願ｧ呈焚蟄励〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.visitors = Number(content);
        session.step++;
        await message.reply('謖・錐譛ｬ謨ｰ繧貞・蜉帙＠縺ｦ縺上□縺輔＞・域焚蟄励・縺ｿ・峨・);
        break;

      case 2:
        if (!isHalfWidthNumber(content)) {
          await message.reply('笶・謖・錐譛ｬ謨ｰ縺ｯ蜊願ｧ呈焚蟄励〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.shimei_count = Number(content);
        session.step++;
        await message.reply('謖・錐螢ｲ荳翫ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞・域焚蟄励・縺ｿ・峨・);
        break;

      case 3:
        if (!isHalfWidthNumber(content)) {
          await message.reply('笶・謖・錐螢ｲ荳翫・蜊願ｧ呈焚蟄励〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.shimei_sales = Number(content);
        session.step++;
        await message.reply('繝輔Μ繝ｼ螢ｲ荳翫ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞・域焚蟄励・縺ｿ・峨・);
        break;

      case 4:
        if (!isHalfWidthNumber(content)) {
          await message.reply('笶・繝輔Μ繝ｼ螢ｲ荳翫・蜊願ｧ呈焚蟄励〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.free_sales = Number(content);
        session.step++;
        await message.reply('邏泌｣ｲ荳翫ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞・域焚蟄励・縺ｿ・峨・);
        break;

      case 5:
        if (!isHalfWidthNumber(content)) {
          await message.reply('笶・邏泌｣ｲ荳翫・蜊願ｧ呈焚蟄励〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
          return;
        }
        session.data.total_sales = Number(content);

        // 螳溽ｸｾ菫晏ｭ假ｼ・Ο繧ｰ逕滓・
        const log = await saveKpiReport(message.guildId, session.data);

        // 繝ｭ繧ｰ蜃ｺ蜉・        await message.channel.send('笨・KPI逕ｳ隲九′螳御ｺ・＠縺ｾ縺励◆縲るｲ謐礼憾豕√・莉･荳九・騾壹ｊ縺ｧ縺吶・);
        await message.channel.send('```' + log + '```');

        // KPI蝣ｱ蜻企幕蟋九・繧ｿ繝ｳ繧貞・陦ｨ遉ｺ
        await sendKpiStartButtons(message.channel);

        activeReportSessions.delete(message.author.id);
        break;

      default:
        await message.reply('笶・荳肴・縺ｪ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・);
        activeReportSessions.delete(message.author.id);
        break;
    }
  } catch (err) {
    console.error('KPI螳溽ｸｾ逕ｳ隲句・蜉帛・逅・お繝ｩ繝ｼ:', err);
    await message.reply('笶・KPI逕ｳ隲九・菫晏ｭ倅ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・);
    activeReportSessions.delete(message.author.id);
  }
}

/**
 * KPI蝣ｱ蜻企幕蟋狗畑縺ｮ逶ｮ讓呻ｼ冗筏隲九・繧ｿ繝ｳ繧帝∽ｿ｡縺吶ｋ繝ｦ繝ｼ繝・ぅ繝ｪ繝・ぅ
 * @param {import('discord.js').TextChannel | import('discord.js').DMChannel | import('discord.js').NewsChannel} channel
 */
async function sendKpiStartButtons(channel) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('kpi_target_start_button')
      .setLabel('KPI逶ｮ讓・)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('kpi_report_start_button')
      .setLabel('KPI逕ｳ隲・)
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({
    content: 'KPI蝣ｱ蜻翫逶ｮ讓呵ｨｭ螳・逕ｳ隲九・繧ｿ繝ｳ',
    components: [row],
  });
}

module.exports = {
  activeReportSessions,
  handleStepChatMessage,
};
