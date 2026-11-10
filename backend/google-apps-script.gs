/**
 * Google Sheets backend for raghav1000000000.github.io
 *
 * Every time someone presses SEND IT on the website, a row lands in the "Leads" tab of the
 * Google Sheet this script is attached to, and (optionally) you get an email about it.
 *
 * Setup (about 5 minutes, see README → "Google Sheets backend"):
 *   1. Create a Google Sheet → Extensions → Apps Script → paste this whole file → Save.
 *   2. Run `setup` once (Run ▶ with `setup` selected) and allow the permissions it asks for.
 *   3. Deploy → New deployment → type "Web app" → Execute as: Me → Who has access: Anyone → Deploy.
 *   4. Copy the Web app URL (ends in /exec) into index.html: <meta name="sheet-endpoint" content="…">.
 */

const SHEET_NAME = "Leads";
const NOTIFY_ME = true;              // email me on every new lead (set false to turn off)
const TIMEZONE = "Asia/Kolkata";     // timestamps in IST
const HEADERS = ["Received (IST)", "Project", "Email", "Picked", "Source", "Page", "Referrer", "Device", "Language"];

/** Receives the website form (application/x-www-form-urlencoded). */
function doPost(e) {
  const p = (e && e.parameter) || {};

  // Honeypot: the form has a hidden "company" field people never see; bots fill it in.
  if (p.company) return json_({ ok: true });

  const project = clean_(p.project, 1000);
  const email = clean_(p.email, 200);
  if (!project || !/^\S+@\S+\.\S+$/.test(email)) return json_({ ok: false, error: "missing project or email" });

  const row = [
    new Date(),
    project,
    email,
    clean_(p.pick, 100),
    clean_(p.source, 40),
    clean_(p.page, 300),
    clean_(p.ref, 300),
    clean_(p.device, 200),
    clean_(p.lang, 20),
  ];

  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // two people sending at the same moment don't overwrite each other
  try {
    sheet_().appendRow(row);
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_ME) {
    try {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        replyTo: email,
        subject: "New lead from your website: " + project.slice(0, 60),
        body: [
          "Someone just sent a project from your website.",
          "",
          "Project: " + project,
          "Email:   " + email,
          "Picked:  " + (row[3] || "-"),
          "Page:    " + (row[5] || "-"),
          "",
          "Reply to this email to answer them directly.",
          "All leads: " + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
        ].join("\n"),
      });
    } catch (err) {
      // The row is already saved; a failed email shouldn't lose the lead.
      console.error("lead email failed: " + err);
    }
  }

  return json_({ ok: true });
}

/** Opening the Web app URL in a browser just says it's alive. */
function doGet() {
  return json_({ ok: true, service: "website leads" });
}

/** Run once from the editor: creates the Leads tab and asks for permissions. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TIMEZONE);
  sheet_();
  if (NOTIFY_ME) MailApp.getRemainingDailyQuota(); // triggers the email permission prompt now, not on the first lead
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#0B0B0A").setFontColor("#D7FF3A");
    sh.getRange("A:A").setNumberFormat("dd mmm yyyy, hh:mm am/pm");
    sh.setColumnWidth(2, 360);
  }
  return sh;
}

/** Trim, cap the length, drop control characters, and stop spreadsheet formula injection. */
function clean_(value, max) {
  const s = String(value == null ? "" : value).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
