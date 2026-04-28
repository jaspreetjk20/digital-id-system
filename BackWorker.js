function workerProcessQueue(){
    const lock = LockService.getScriptLock();
    const cache = CacheService.getScriptCache();

    //If another worker is already running just exit
    if (!lock.tryLock(2000)) return;

    try{
        //Pull the queue from cache
        let queueString = cache.get("scanQueue");
        if (!queueString) return;
    
        let scanQueue = JSON.parse(queueString);
        if (scanQueue.length === 0) return;

        cache.remove("scanQueue"); //Clear cache

        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const logsSheet = ss.getSheetByName("Logs");
        const studentsSheet = ss.getSheetByName("Users");

        //Batch Write to Logs Tab
        const logRows = scanQueue.map(scan => [
        new Date(scan.timestamp), // Column A: Timestamp
        scan.uuid,                // Column B: Student_ID
        scan.name,                // Column C: Name
        scan.status               // Column D: Status/Action
        ]);
        const targetRange = logsSheet.getRange(logsSheet.getLastRow() + 1, 1, logRows.length, 4).setValues(logRows);
        targetRange.setValues(logRows);

        //Format the last scan time
        targetRange.offset(0, 0, logRows.length, 1).setNumberFormat("dd-mm-yyyy HH:mm:ss");

        //Batch Update Students Tab (Current_Status & Last_Scan_Time)
        const studentsData = studentsSheet.getDataRange().getValues();
        const updatesMap = {};
        scanQueue.forEach(scan => { updatesMap[scan.uuid] = scan; });

        let dataChanged = false;
        for (let i = 1; i < studentsData.length; i++) {
            const sId = studentsData[i][0].toString();
            if (updatesMap[sId]) {
            studentsData[i][4] = updatesMap[sId].status;    // Column E
            studentsData[i][5] = updatesMap[sId].timestamp; // Column F
            dataChanged = true;
            }
        }
    
        if (dataChanged) {
            studentsSheet.getRange(1, 1, studentsData.length, studentsData[0].length).setValues(studentsData);
        }
    }

    catch(e){
        console.error("Worker Error: " + e.toString());
    }

    finally{
        lock.releaseLock();
    }
}