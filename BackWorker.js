function workerProcessQueue() {
  const lock = LockService.getScriptLock();
  const cache = CacheService.getScriptCache();

  if (!lock.tryLock(2000)) return;

  try {
    const queueString = cache.get("scanQueue");
    if (!queueString) return;

    const scanQueue = JSON.parse(queueString);
    if (!scanQueue.length) return;

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const logsSheet = ss.getSheetByName(LOGS_SHEET);
    const usersSheet = ss.getSheetByName(USERS_SHEET);

    // WRITE LOGS (BATCH)
    const logRows = scanQueue.map(scan => [
      new Date(scan.timestamp),
      scan.uuid,
      scan.name,
      scan.status
    ]);

    const startRow = logsSheet.getLastRow() + 1;

    logsSheet
      .getRange(startRow, 1, logRows.length, 4)
      .setValues(logRows);

    logsSheet
      .getRange(startRow, 1, logRows.length, 1)
      .setNumberFormat("dd-mm-yyyy HH:mm:ss");

    // UPDATE USERS SHEET
    const usersData = usersSheet.getDataRange().getValues();

    const map = {};
    for (let i = 0; i < scanQueue.length; i++) {
      map[scanQueue[i].uuid] = scanQueue[i];
    }

    let changed = false;

    for (let i = 1; i < usersData.length; i++) {
      const id = String(usersData[i][0]);

      if (map[id]) {
        usersData[i][4] = map[id].status;
        usersData[i][5] = map[id].timestamp;
        changed = true;
      }
    }

    if (changed) {
      usersSheet
        .getRange(1, 1, usersData.length, usersData[0].length)
        .setValues(usersData);
    }
    
    // CLEAR QUEUE ONLY AFTER SUCCESS
    cache.remove("scanQueue");

  } catch (e) {
    console.error("Worker Error: " + e.toString());

  } finally {
    lock.releaseLock();
  }
}