// NETLIFY ENTRY POINT 
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        success: false,
        message: "Empty request body"
      });
    }

    const data = JSON.parse(e.postData.contents);
    const barcode = data.barcode;

    if (!barcode) {
      return jsonResponse({
        success: false,
        message: "Missing barcode"
      });
    }

    const result = processScan(barcode);

    return jsonResponse(result);

  } catch (error) {
    console.error(error);
    return jsonResponse({
      success: false,
      message: error.toString()
    });
  }
}


// CORE SCAN ENGINE
function processScan(uuid) {
  const lock = LockService.getScriptLock();
  const cache = CacheService.getScriptCache();

  try {
    lock.waitLock(5000);

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const studentSheet = ss.getSheetByName(USERS_SHEET);

    // CACHE LOOKUP
    let stateString = cache.get("state_" + uuid);
    let studentData = stateString ? JSON.parse(stateString) : null;

    // SHEET FALLBACK
    if (!studentData) {
      const students = studentSheet.getDataRange().getValues();

      for (let i = 1; i < students.length; i++) {
        const rowId = students[i][0];
        if (!rowId) continue;

        if (String(rowId) === String(uuid)) {
          studentData = {
            name: students[i][1],
            status: students[i][4] || "OUT",
            lastScan: Number(students[i][5]) || 0
          };
          break;
        }
      }
    }

    // INVALID ID
    if (!studentData) {
      return {
        success: false,
        message: "Invalid ID: " + uuid
      };
    }

    // DEBOUNCE 
    const currentTime = Date.now();
    const diff = (currentTime - Number(studentData.lastScan)) / 1000;

    if (diff < 10) {
      return {
        success: false,
        message: "Too fast! Wait " + Math.ceil(10 - diff) + "s."
      };
    }

    // TOGGLE STATUS
    const newStatus = studentData.status === "IN" ? "OUT" : "IN";

    // UPDATE CACHE 
    studentData.status = newStatus;
    studentData.lastScan = currentTime;

    cache.put("state_" + uuid, JSON.stringify(studentData), 3600);

    // ADD TO QUEUE
    let queueString = cache.get("scanQueue");
    let scanQueue = queueString ? JSON.parse(queueString) : [];

    scanQueue.push({
      uuid: uuid,
      name: studentData.name,
      timestamp: currentTime,
      status: newStatus
    });

    cache.put("scanQueue", JSON.stringify(scanQueue), 3600);

    // RESPONSE IMMEDIATELY
    return {
      success: true,
      name: studentData.name,
      status: newStatus,
      timestamp: currentTime
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Server Busy. Try again"
    };

  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// TEST
function testScan() {
  const result = processScan("101");
  console.log(result);
}