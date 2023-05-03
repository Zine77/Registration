function doGet(e) {
  return HtmlService.createTemplateFromFile("index").evaluate()
  .addMetaTag('viewport', 'width=device-width, initial-scale=1')
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}

function checkLogin(employeeid) {
  var url = 'https://docs.google.com/spreadsheets/d/190lb4RKqA8TJrOWQA6_IIuTJ0PAw9U3NvPyAkdvVeco/edit#gid=0';
  var ss= SpreadsheetApp.openByUrl(url);
  var webAppSheet = ss.getSheetByName("Employee");
  var getLastRow =  webAppSheet.getLastRow();
  var found_record = '';
  for(var i = 1; i <= getLastRow; i++)
  {
   if(webAppSheet.getRange(i, 1).getDisplayValue().toUpperCase() == employeeid.toUpperCase())
   {
     found_record = webAppSheet.getRange(i,2).getDisplayValue();
     //found_record = 'TRUE';
   }    
  }
  if(found_record == '')
  {
    found_record = 'FALSE';
  }
  return found_record;
}

function userClick(data) {
  let ss = SpreadsheetApp.openById('190lb4RKqA8TJrOWQA6_IIuTJ0PAw9U3NvPyAkdvVeco');
  let sheet = ss.getSheets()[0];
  let response = Maps.newGeocoder().reverseGeocode(data.lat, data.lon);
  let geoAddress = response.results[0].formatted_address;
  var employeeid2 = "'"+data.employeeid;

  var strYear543 = parseInt(Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy")) + 543;  
  var strhour=Utilities.formatDate(new Date(), "Asia/Bangkok", "HH");
  var strMinute=Utilities.formatDate(new Date(), "Asia/Bangkok", "mm");
  var strMonth1 = Utilities.formatDate(new Date(), "Asia/Bangkok", "M");
  var strMonthCut1 = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]  
  var strMonthThai = strMonthCut1[strMonth1];
  var strDay = Utilities.formatDate(new Date(), "Asia/Bangkok", "d"); // d ไม่มี 0 นำ dd มี 0 นำ
  var daytime=strDay+' '+strMonthThai+' '+strYear543+ ' / '+strhour+':'+strMinute+' น.';
  
  if(data.statusregis=="เข้างาน")
  {
    if(strhour=="06"||strhour=="07"||strhour=="08")
    {
      var statustime = "ปกติ"
    }else
    {
      var statustime = "สาย"
    }
  }else
  {
    var statustime = "ปกติ"
  }
  //Input data in spreadsheet
  sheet.appendRow([employeeid2,data.username,Utilities.formatDate(new Date(), "GMT+7", "yyyy/MM/dd"),Utilities.formatDate(new Date(), "GMT+7", "HH:mm:ss"),data.statusregis, `${data.lat},${data.lon}`, geoAddress,statustime,data.remark])

  //LINE Notify (Text+Map)
  var text_data1 = '📣 แจ้งข้อมูลการลงทะเบียนเข้างาน\n';
  text_data1 += '⏰วัน-เวลา: '+daytime+'\n👨‍💼รหัสพนักงาน: '+data.employeeid.substring(0,4)+'xxxx'+'\n👨‍💼ชื่อ-นามสกุล: '+data.username+'\n🚪สถานะ: '+data.statusregis+' / '+statustime+'\n👨หมายเหตุ(ถ้ามี): '+data.remark  
  var latitude = data.lat
  var longitude = data.lon
  var map = Maps.newStaticMap()
  .setSize(600,600)  //(Max:1300 X 1300)
  .setLanguage('TH')
  .setMobile(true)
  .setMapType(Maps.StaticMap.Type.HYBRID)
  
  map.addMarker(latitude, longitude)
  var mapBlob = map.getBlob()

  sendHttpPostImage(text_data1,mapBlob)
}

function sendHttpPostImage(text_data1, mapBlob){
  var token = "SU2ezZ0dBblINEmoBjKNHZpY4ll3SFpg7b3l75mTVtR";
  var formData = {
  'message' : '\n'+text_data1,
  'imageFile': mapBlob
  }
  var options =
  {
  "method"  : "post",
  "payload" : formData,  // message, imageFile, formData, Post
  "headers" : {"Authorization" : "Bearer "+ token}
  };

  UrlFetchApp.fetch("https://notify-api.line.me/api/notify",options);
}
