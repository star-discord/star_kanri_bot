const fs = require('fs').promises;
const path = require('path');

// 出退勤データ保存用のベースディレクトリ
const baseDir = path.resolve(__dirname, '../data');

/**
 * 出勤記録を保存
 * @param {string} guildId
 * @param {object} attendanceData
 */
async function saveWorkStart(guildId, attendanceData) {
  try {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    const dir = path.join(baseDir, guildId);
    const fileName = `attendance_${dateStr}.json`;
    const filePath = path.join(dir, fileName);

    await fs.mkdir(dir, { recursive: true });

    let fileData = { date: dateStr, records: [] };
    
    try {
      const existingData = await fs.readFile(filePath, 'utf8');
      fileData = JSON.parse(existingData);
    } catch (error) {
      // ファイルが存在しない場合は新規作成
    }

    // 既存の出勤記録があるかチェック
    const existingIndex = fileData.records.findIndex(
      record => record.userId === attendanceData.userId && !record.workEndTime
    );

    if (existingIndex !== -1) {
      throw new Error('already_working');
    }

    // 新しい出勤記録を追加
    fileData.records.push({
      ...attendanceData,
      recordId: Date.now().toString(),
      createdAt: new Date().toISOString()
    });

    await fs.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf8');
    return { success: true };

  } catch (error) {
    if (error.message === 'already_working') {
      return { success: false, reason: 'already_working' };
    }
    console.error('出勤記録保存エラー:', error);
    return { success: false, reason: 'save_error', error };
  }
}

/**
 * 退勤記録を保存
 * @param {string} guildId
 * @param {string} userId
 * @param {object} endData
 */
async function saveWorkEnd(guildId, userId, endData) {
  try {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    const dir = path.join(baseDir, guildId);
    const fileName = `attendance_${dateStr}.json`;
    const filePath = path.join(dir, fileName);

    let fileData;
    try {
      const existingData = await fs.readFile(filePath, 'utf8');
      fileData = JSON.parse(existingData);
    } catch (error) {
      return { success: false, reason: 'no_work_start' };
    }

    // 未退勤の出勤記録を検索
    const recordIndex = fileData.records.findIndex(
      record => record.userId === userId && !record.workEndTime
    );

    if (recordIndex === -1) {
      return { success: false, reason: 'no_work_start' };
    }

    // 退勤時間を記録
    fileData.records[recordIndex].workEndTime = endData.workEndTime;
    fileData.records[recordIndex].workEndDisplay = endData.workEndDisplay;
    fileData.records[recordIndex].status = 'completed';

    await fs.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf8');
    return { success: true, record: fileData.records[recordIndex] };

  } catch (error) {
    console.error('退勤記録保存エラー:', error);
    return { success: false, reason: 'save_error', error };
  }
}

/**
 * 今日の出退勤状況を取得
 * @param {string} guildId
 */
async function getTodayAttendance(guildId) {
  try {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    const dir = path.join(baseDir, guildId);
    const fileName = `attendance_${dateStr}.json`;
    const filePath = path.join(dir, fileName);

    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return { date: dateStr, records: [] };
    }

  } catch (error) {
    console.error('出退勤状況取得エラー:', error);
    return { date: '', records: [] };
  }
}

/**
 * 勤務時間を計算
 * @param {Date} startTime
 * @param {Date} endTime
 */
function calculateWorkHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // 小数点1桁まで
}

/**
 * 時間帯別統計を生成
 * @param {Array} records
 */
function generateTimeSlotStats(records) {
  const stats = {
    '20時': 0,
    '21時': 0,
    '22時': 0,
    '今から': 0,
    '退勤済み': 0,
    '未退勤': 0
  };

  records.forEach(record => {
    // 時間帯別カウント
    if (record.workStartDisplay === '20時') stats['20時']++;
    else if (record.workStartDisplay === '21時') stats['21時']++;
    else if (record.workStartDisplay === '22時') stats['22時']++;
    else if (record.workStartDisplay.includes(':')) stats['今から']++;

    // 退勤状況カウント
    if (record.workEndTime) stats['退勤済み']++;
    else stats['未退勤']++;
  });

  return stats;
}

module.exports = {
  saveWorkStart,
  saveWorkEnd,
  getTodayAttendance,
  calculateWorkHours,
  generateTimeSlotStats
};
