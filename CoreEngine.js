//Scanner reads a QR code

function processScan(uuid){
    const lock = LockService.getScriptLock();
    const cache = CacheService.getScriptCache();

    try{
        lock.waitLock(5000); //prevents row conflicts, duplicates, race conditions. Promotes high concurrency
        
        let stateString = cache.get("state_" + uuid);
        let studentData = stateString ? JSON.parse(stateString) : null;

        if(!studentData){
            const ss = SpreadsheetApp.getActiveSpreadsheet();
            const studentSheet = ss.getSheetByName("Users");
            const students = studentSheet.getDataRange().getValues();

            for(let i=1; i<students.length; i++){
                let rowId = students[i][0];
      
                // GUARD: If the ID cell is empty or null, skip to the next row
                if (rowId === "" || rowId === null || typeof rowId === 'undefined') {
                    continue; 
                }

                if(String(rowId) === String(uuid)){
                    studentData = {
                        name: students[i][1],
                        status: students[i][4] || "OUT",
                        lastScan: students[i][5] || 0
                    };
                    break;
                }
            }
        }
 
        //If student ID record does not exist
        if (!studentData) return { success: false, message: "Invalid ID: " + uuid };

        //Debounce Check : Prevent double tap scans
        const currentTime = new Date().getTime();
        const diff = (currentTime - studentData.lastScan) / 1000;
        if (diff < 10) {
            return { success: false, message: "Too fast! Wait " + Math.ceil(10 - diff) + "s." };
        }

        const newStatus = (studentData.status === "IN") ? "OUT" : "IN";

        //Update in queue, sheet writing is slow - instant frontend response
        let queueString = cache.get("scanQueue");
        let scanQueue = queueString ? JSON.parse(queueString) : [];

        scanQueue.push({
            uuid: uuid,
            name: studentData.name,
            timestamp: currentTime,
            status: newStatus
        });

        //Save the update from queue to cache & update the cache state for the next lookup
        cache.put("scanQueue", JSON.stringify(scanQueue), 21600);

        studentData.status = newStatus;
        studentData.lastScan = currentTime;
        cache.put("state_" + uuid, JSON.stringify(studentData), 21600);

        //Instant response to frontend
        return { 
            success: true, 
            name: studentData.name, 
            status: newStatus 
        };
    }

    catch(error){
        console.error(error);
        return {success: false, message: "Server Busy. Try again"};
    }
    
    finally{
        lock.releaseLock();
    }
}

function testScan() {
  // Replace '101' with whatever ID you have in your Students sheet
  const mockId = "101"; 
  const result = processScan(mockId);
  console.log("Scan Response:", result);
}