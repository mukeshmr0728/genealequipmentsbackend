function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    try {
        var data = JSON.parse(e.postData.contents);

        var timestamp = new Date();
        var name = data.name;
        var email = data.email;
        var phone = data.phone;
        var message = data.message;
        var pageSource = data.pageSource;

        sheet.appendRow([timestamp, name, email, phone, message, pageSource]);

        return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
