const fs = require('fs');
const path = require('path');

/**
 * 謖・ｮ壹ョ繧｣繝ｬ繧ｯ繝医Μ縺九ｉ繝上Φ繝峨Λ繧定ｪｭ縺ｿ霎ｼ縺ｿ縲…ustomId/customIdStart 縺ｫ繧医ｋ繝ｫ繝ｼ繝・ぅ繝ｳ繧ｰ髢｢謨ｰ繧定ｿ斐☆
 * 蜷・ワ繝ｳ繝峨Λ縺ｯ { customId, handle } 縺ｾ縺溘・ { customIdStart, handle } 繧偵お繧ｯ繧ｹ繝昴・繝医☆繧句ｿ・ｦ√′縺ゅｋ
 * 
 * @param {string} dirPath - 隱ｭ縺ｿ霎ｼ繧繝・ぅ繝ｬ繧ｯ繝医Μ縺ｮ邨ｶ蟇ｾ繝代せ
 * @returns {(customId: string) => object|null} - 蟇ｾ蠢懊☆繧九ワ繝ｳ繝峨Λ繧定ｿ斐☆髢｢謨ｰ
 */
function loadHandlers(dirPath) {
  const handlers = {};              // 螳悟・荳閾ｴ逕ｨ繝上Φ繝峨Λ譬ｼ邏・  const startsWithHandlers = [];    // 蜑肴婿荳閾ｴ逕ｨ繝上Φ繝峨Λ譬ｼ邏・
  if (!fs.existsSync(dirPath)) {
    console.warn(`笞・・[handlerLoader] 繝・ぅ繝ｬ繧ｯ繝医Μ縺悟ｭ伜惠縺励∪縺帙ｓ: ${dirPath}`);
    return () => null;
  }

  const files = fs.readdirSync(dirPath).filter(file => 
    file.endsWith('.js') && 
    file !== 'index.js' && 
    file !== 'handleSelect.js' && 
    file !== 'install_channel.js'
  );

  for (const file of files) {
    const modulePath = path.join(dirPath, file);
    try {
      // 繧ｭ繝｣繝・す繝･繧ｯ繝ｪ繧｢・磯幕逋ｺ荳ｭ縺ｮ縺ｿ譛牙柑・・      delete require.cache[require.resolve(modulePath)];

      const mod = require(modulePath);

      if (mod && typeof mod.handle === 'function') {
        if (typeof mod.customId === 'string') {
          if (handlers[mod.customId]) {
            console.warn(`笞・・[handlerLoader] ${file} 縺ｮ customId "${mod.customId}" 縺ｯ譌｢縺ｫ逋ｻ骭ｲ縺輔ｌ縺ｦ縺・∪縺吶ゆｸ頑嶌縺阪＆繧後∪縺吶Ａ);
          }
          handlers[mod.customId] = mod;
        } else if (typeof mod.customIdStart === 'string') {
          if (startsWithHandlers.some(h => h.key === mod.customIdStart)) {
            console.warn(`笞・・[handlerLoader] ${file} 縺ｮ customIdStart "${mod.customIdStart}" 縺ｯ譌｢縺ｫ逋ｻ骭ｲ縺輔ｌ縺ｦ縺・∪縺吶ゆｸ頑嶌縺阪＆繧後∪縺吶Ａ);
          }
          startsWithHandlers.push({ key: mod.customIdStart, handler: mod });
        } else {
          console.warn(`笞・・[handlerLoader] ${file} 縺ｫ customId 縺ｾ縺溘・ customIdStart 縺悟ｮ夂ｾｩ縺輔ｌ縺ｦ縺・∪縺帙ｓ`);
        }
      } else {
        console.warn(`笞・・[handlerLoader] ${file} 縺ｯ譛牙柑縺ｪ繝上Φ繝峨Λ縺ｧ縺ｯ縺ゅｊ縺ｾ縺帙ｓ・・andle 髢｢謨ｰ縺梧悴螳夂ｾｩ・荏);
      }

    } catch (err) {
      console.error(`笶・[handlerLoader] 繝上Φ繝峨Λ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ螟ｱ謨・(${file}):`, err);
    }
  }

  // 蜑肴婿荳閾ｴ繝上Φ繝峨Λ縺ｯ繧ｭ繝ｼ髟ｷ縺ｮ髯埼・〒繧ｽ繝ｼ繝医＠縲√ｈ繧企聞縺・・繝ｬ繝輔ぅ繝・け繧ｹ繧貞━蜈・  startsWithHandlers.sort((a, b) => b.key.length - a.key.length);

  /**
   * customId 縺ｫ蟇ｾ蠢懊☆繧九ワ繝ｳ繝峨Λ繧定ｿ斐☆・亥ｮ悟・荳閾ｴ蜆ｪ蜈・竊・蜑肴婿荳閾ｴ・・   * @param {string} customId
   * @returns {object|null}
   */
  return function findHandler(customId) {
    if (handlers[customId]) return handlers[customId];

    for (const { key, handler } of startsWithHandlers) {
      if (customId.startsWith(key)) return handler;
    }

    console.warn(`笞・・[handlerLoader] 蟇ｾ蠢懊☆繧九ワ繝ｳ繝峨Λ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ: ${customId}`);
    return null;
  };
}

module.exports = { loadHandlers };
