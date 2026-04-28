//QR generation Logic

function generateQRs() {

  const FOLDER_ID = "12Bxh_S5LtP0OdxKwNDS16vqgiN0X78YZ";
  const USERS_SHEET_NAME = "Users";

  //Access the Sheet & Drive
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(USERS_SHEET_NAME);
  const folder = DriveApp.getFolderById(FOLDER_ID);
 
  //Get all data in one go
  const data = sheet.getDataRange().getValues();

  for(let i = 1; i < data.length; i++){
    let userId = data[i][0];
    let userName = data[i][1];
    let existingLink = data[i][3];

    if(userId && !existingLink){

      try{
        
        //Use the API to generate image for you
        let apiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(userId);

        let response = UrlFetchApp.fetch(apiUrl);
        let blob = response.getBlob().setName(userId + "_" + userName + "_QR.png");
        
        //Save it to your drive
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





