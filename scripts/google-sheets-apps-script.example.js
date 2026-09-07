/**
 * Google Apps Script — paste into Extensions → Apps Script on your Sheet.
 *
 * Deploy steps (required or you get 401 Unauthorized):
 * 1. Create a Google Sheet named "Leads" (or let the script create it).
 * 2. Extensions → Apps Script → paste this file's doPost/doGet code (remove the export).
 * 3. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone   ← must be Anyone (not "Anyone with Google account")
 * 4. Copy the Web app URL into Netlify + local .env as GOOGLE_SHEETS_WEBHOOK_URL
 * 5. After any script edit, Deploy → Manage deployments → Edit → New version → Deploy
 *
 * Test: open the Web app URL in a browser — you should see {"ok":true,"service":"leads"}.
 */

/*
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'leads' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads') ||
      SpreadsheetApp.getActiveSpreadsheet().insertSheet('Leads');

    const data = JSON.parse(e.postData.contents);
    const headers = [
      'timestamp', 'name', 'email', 'phone', 'company', 'country', 'timezone',
      'intent', 'interest', 'project_type', 'timeline', 'budget', 'qualified',
      'sentiment', 'summary', 'next_steps', 'requirements', 'scope', 'notes', 'turns'
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.company || '',
      data.country || '',
      data.timezone || '',
      data.intent || '',
      data.interest || '',
      data.project_type || '',
      data.timeline || '',
      data.budget || '',
      data.qualified === true || data.qualified === 'true',
      data.sentiment || '',
      data.summary || '',
      data.next_steps || '',
      data.requirements || '',
      data.scope || '',
      data.notes || '',
      data.turns || 0,
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/

export {};
