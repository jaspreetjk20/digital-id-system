// Handles incoming requests and serves the correct HTML interface
function doGet(e) {
  const mode = e.parameter.mode;
  
  // Get the email 
  const activeEmail = Session.getActiveUser().getEmail();
  
  // ADMIN ROUTE WITH AUTHENTICATION 
  if (mode === 'admin') {
    
    // Check the Admins sheet
    if (!checkIfAdmin(activeEmail)) {
      return createAccessDeniedScreen(activeEmail, "Admin Privileges Required");
    }
    
    // Access Granted: Serve the Admin panel
    return HtmlService.createTemplateFromFile('admin')
      .evaluate()
      .setTitle('Enterprise Admin Panel')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  //DEFAULT ROUTE (SCANNER) WITH AUTHENTICATION
  
  // Check the Users sheet
  if (!checkIfUser(activeEmail)) {
    return createAccessDeniedScreen(activeEmail, "Student Registration Required");
  }

  // Access Granted: Serve the Scanner app
  return HtmlService.createTemplateFromFile('scanner')
    .evaluate()
    .setTitle('Gate Scanner')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// SECURITY & BOUNCER FUNCTIONS

function createAccessDeniedScreen(email, reason) {
  return HtmlService.createHtmlOutput(`
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; text-align: center; padding-top: 100px; background-color: #0f172a; color: #f8fafc; height: 100vh; margin: 0; overflow: hidden;">
      <h1 style="color: #fb7185; font-size: 3rem; margin-bottom: 10px;">⛔ Access Denied</h1>
      <p style="color: #94a3b8; font-size: 1.2rem; margin-bottom: 5px;">Your email (<b>${email || 'Anonymous/Not Logged In'}</b>) is not authorized.</p>
      <p style="color: #fbbf24; font-size: 1rem; margin-bottom: 20px;">Reason: ${reason}</p>
      <p style="color: #94a3b8;">Please contact the system administrator to request access.</p>
    </div>
  `)
  .setTitle("Access Denied")
  .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// The Admin Bouncer
function checkIfAdmin(email) {
  if (!email) return false; 
  
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(ADMINS_SHEET);
  if (!sheet) return false; 

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const sheetEmail = data[i][1].toString().trim().toLowerCase();
    const userEmail = email.toString().trim().toLowerCase();
    if (sheetEmail === userEmail) return true; 
  }
  return false;
}

// The Student Bouncer 
function checkIfUser(email) {
  if (!email) return false; 
  
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(USERS_SHEET);
  if (!sheet) return false; 

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    // In your setup, Email is in Column C (Index 2)
    const sheetEmail = data[i][2].toString().trim().toLowerCase();
    const userEmail = email.toString().trim().toLowerCase();
    if (sheetEmail === userEmail) return true; 
  }
  return false;
}