import fs from 'fs/promises';
import path from 'path';

const dataDir = path.resolve('./data');
const shopsFilePath = path.join(dataDir, 'kpi_shops.json');
const targetFilePath = path.join(dataDir, 'kpi_ninzuu.json');

let fileLock = false;

async function waitUnlock() {
  while (fileLock) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

export async function readShopList() {
  try {
    await waitUnlock();
    await fs.mkdir(dataDir, { recursive: true });
    const data = await fs.readFile(shopsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    console.error('店舗リスト読み込みエラー:', e);
    return [];
  }
}

export async function addShop(shopName) {
  await waitUnlock();
  fileLock = true;
  try {
    const shops = await readShopList();
    if (shops.includes(shopName)) {
      fileLock = false;
      return { success: false, reason: 'duplicate' };
    }
    shops.push(shopName);
    await fs.writeFile(shopsFilePath, JSON.stringify(shops, null, 2), 'utf-8');
    fileLock = false;
    return { success: true };
  } catch (e) {
    console.error('店舗リスト書き込みエラー:', e);
    fileLock = false;
    return { success: false, reason: 'exception', error: e };
  }
}

export async function readTargets() {
  try {
    await waitUnlock();
    await fs.mkdir(dataDir, { recursive: true });
    const data = await fs.readFile(targetFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    if (e.code === 'ENOENT') return {};
    console.error('KPI目標読み込みエラー:', e);
    return {};
  }
}

export async function saveTargets(targets) {
  await waitUnlock();
  fileLock = true;
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(targetFilePath, JSON.stringify(targets, null, 2), 'utf-8');
    fileLock = false;
    return true;
  } catch (e) {
    console.error('KPI目標書き込みエラー:', e);
    fileLock = false;
    return false;
  }
}

export async function addTargets(shops, date, targetCount, setBy) {
  try {
    const targets = await readTargets();

    for (const shop of shops) {
      if (!targets[shop]) targets[shop] = [];

      const idx = targets[shop].findIndex(t => t.date === date);
      const newEntry = {
        date,
        target: Number(targetCount),
        setBy,
        setAt: new Date().toISOString(),
      };

      if (idx !== -1) {
        targets[shop][idx] = newEntry;
      } else {
        targets[shop].push(newEntry);
      }
    }

    const saved = await saveTargets(targets);
    if (saved) {
      return { success: true };
    } else {
      return { success: false, reason: 'save_failed' };
    }

  } catch (e) {
    console.error('KPI目標登録エラー:', e);
    return { success: false, reason: 'exception', error: e };
  }
}
