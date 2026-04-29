function getAdminStats() {
  const ss = SpreadsheetApp.openById(SHEET_ID); 
  const usersSheet = ss.getSheetByName(USERS_SHEET);
  const logsSheet = ss.getSheetByName(LOGS_SHEET);
  
  const userData = usersSheet.getDataRange().getValues();
  const logData = logsSheet.getDataRange().getValues();
  
  const users = userData.slice(1);
  const logs = logData.slice(1);   
  
  const totalStudents = users.length;
  
  const currentlyIn = users.filter(row => row[4] === "IN").length; 
  
  // Get last 10 logs for the Live Stream
  const recentLogs = logs.slice(-10).reverse().map(row => ({
    timestamp: Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "hh:mm:ss a"),
    name: row[2],
    action: row[3] 
  }));

  return {
    totalStudents: totalStudents,
    currentlyIn: currentlyIn,
    recentLogs: recentLogs
  };
}

/**
 * Fetch users for the Registry Table
*/
function getUsersList() {
  const ss = SpreadsheetApp.openById(SHEET_ID); 
  const usersSheet = ss.getSheetByName(USERS_SHEET);
  const data = usersSheet.getDataRange().getValues();
  
  return data.slice(1).map(row => ({
    id: row[0],       
    name: row[1],     
    email: row[2],    
    qrLink: row[3]    
  }));
}

/**
 * Register a new student from the form
 */
function registerNewUser(formData) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(USERS_SHEET);
    
    // Check if ID already exists
    const existingIds = sheet.getRange(2, 1, sheet.getLastRow(), 1).getValues().flat();
    if (existingIds.includes(formData.id)) {
      return { success: false, message: "Error: Student ID already exists!" };
    }

    sheet.appendRow([
      formData.id, 
      formData.name, 
      formData.email, 
      "",       
      "OUT",    
      new Date() 
    ]);
    
    return { success: true, message: `Successfully registered ${formData.name}! Now click 'Generate Missing QRs'.` };
  } catch (error) {
    return { success: false, message: "Server Error: " + error.toString() };
  }
}

/**
 * Trigger the QR Generation
 */
function triggerQRGeneration() {
  try {
    generateQRs();
    return { success: true, message: "QR Batch Generation started. Please check your Google Drive folder in a few minutes." };
  } catch (error) {
    return { success: false, message: "Error: " + error.toString() };
  }
}

/**
 * Delete a user from the system 
 */
function deleteUser(userId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(USERS_SHEET);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === userId.toString()) {
        
        const qrLink = data[i][3]; 
        
        if (qrLink && qrLink.includes("drive.google.com")) {
          const fileIdMatch = qrLink.match(/[-\w]{25,}/);
          
          if (fileIdMatch) {
            try {
              DriveApp.getFileById(fileIdMatch[0]).setTrashed(true); 
            } catch (driveErr) {
              Logger.log("Drive file not found or already deleted: " + driveErr);
            }
          }
        }

        sheet.deleteRow(i + 1); 
        
        return { success: true, message: `User ${userId} and their QR file were successfully deleted.` };
      }
    }
    
    return { success: false, message: "Error: User ID not found." };
  } catch (error) {
    return { success: false, message: "Server Error: " + error.toString() };
  }
}

/**
 * Fetche data for the Insights & Reporting Tab
 */
function getInsightsData(targetDateStr) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const usersSheet = ss.getSheetByName(USERS_SHEET);
  const logsSheet = ss.getSheetByName(LOGS_SHEET);

  const users = usersSheet.getDataRange().getValues().slice(1);
  const logs = logsSheet.getDataRange().getValues().slice(1);

  let targetDateString = targetDateStr;
  if (!targetDateString) {
    targetDateString = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  const dailySnapshots = {}; 
  const presentIds = new Set();
  let totalScans = 0;

  // Process Logs for the specific date
  logs.forEach(row => {
    const logDateString = Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "yyyy-MM-dd");
    
    if (logDateString === targetDateString) {
      totalScans++;
      const timestampStr = Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "hh:mm:ss a");
      const userId = row[1].toString();
      const userName = row[2];

      presentIds.add(userId);

      // Snapshot Logic: First In / Last Out
      if (!dailySnapshots[userId]) {
        dailySnapshots[userId] = { id: userId, name: userName, firstIn: timestampStr, lastOut: timestampStr };
      } else {
        dailySnapshots[userId].lastOut = timestampStr;
      }
    }
  });

  const snapshotArray = Object.values(dailySnapshots);

  // 2. Absence Tracker
  const absentUsers = [];
  users.forEach(row => {
    const userId = row[0].toString();
    if (!presentIds.has(userId)) {
      absentUsers.push({ id: row[0], name: row[1], email: row[2] });
    }
  });

  return {
    targetDate: targetDateString,
    totalScans: totalScans,
    dailySnapshots: snapshotArray,
    absentUsers: absentUsers
  };
}