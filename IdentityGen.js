//QR generation Logic

function generateQRs() {

  //Access the Sheet & Drive
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(USERS_SHEET);
  const folder = DriveApp.getFolderById(FOLDER_ID);
 
  //Get all data 
  const data = sheet.getDataRange().getValues();

  for(let i = 1; i < data.length; i++){
    let userId = data[i][0];
    let userName = data[i][1];
    let existingLink = data[i][3];

    if(userId && !existingLink){

      try{
        
        //API to generate image
        let apiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(userId);

        let response = UrlFetchApp.fetch(apiUrl);
        let blob = response.getBlob().setName(userId + "_" + userName + "_QR.png");
        
        //Save to drive
        let file = folder.createFile(blob);
        
        //Set permissions so that the Scanner App can see the image
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        //Write the link back to excel sheet
        sheet.getRange(i + 1, 4).setValue(file.getUrl());
        
        //Log process to the console
        Logger.log("Generated QR for: " + userName);

        Utilities.sleep(500);
      }

      catch(err){
        Logger.log("Error for " + userName + ": " + err.toString());
      }
    }
  }
}  





