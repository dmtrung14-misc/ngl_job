// import { SPREADSHEET_ID, GOOGLE_CLIENT_ID } from "./config.js"
document.addEventListener('DOMContentLoaded', () => {
  const companyInput = document.getElementById('company');
  const linkInput = document.getElementById('link');
  const referrerInput = document.getElementById('referrer');
  const recruiterInput = document.getElementById('recruiter');
  const dateInput = document.getElementById('date');

  // Prefill link and date
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    linkInput.value = tabs[0]?.url || '';
  });
  const today = new Date();
  dateInput.value = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`;

  // When company changes, fetch from Firebase
  companyInput.addEventListener('change', () => {
    const company = companyInput.value.trim();
    if (!company) return;
    // Lookup company in Firebase
    const compRef = firebase.database().ref('companies/' + company);
    compRef.once('value').then(snapshot => {
      const data = snapshot.val();
      if (data) {
        // Auto-fill if contacts exist
        if (data.referrers) {
          const firstRef = Object.values(data.referrers)[0];
          referrerInput.value = firstRef.name || '';
        }
        if (data.recruiters) {
          const firstRec = Object.values(data.recruiters)[0];
          recruiterInput.value = firstRec.name || '';
        }
      }
    }).catch(err => console.error('Firebase fetch error:', err));
  });

  // Add Job button handler
  document.getElementById('addJobButton').addEventListener('click', async () => {
    const company = companyInput.value.trim();
    const link = linkInput.value.trim();
    const referrer = referrerInput.value.trim();
    const recruiter = recruiterInput.value.trim();
    const date = dateInput.value;
    if (!company || !link) {
      alert('Company and Link are required.');
      return;
    }
    try {
      await insertJobToSheet(company, link, referrer, recruiter, date);
      alert('Job added to Sheet!');
      // Clear form
      companyInput.value = '';
      referrerInput.value = '';
      recruiterInput.value = '';
    } catch (e) {
      console.error(e);
      alert('Error adding job: ' + e.message);
    }
  });

  // “Report Employee” button opens report.html
  document.getElementById('goReport').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
  });
});

// Uses Google Sheets API to insert a new row at top (row 2) and fill it
async function insertJobToSheet(company, link, referrer, recruiter, date) {
  // Get OAuth token (interactive)
  const token = await new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({interactive: true}, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(new Error(chrome.runtime.lastError?.message || 'Auth failed'));
      } else {
        resolve(token);
      }
    });
  });
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };
  const spreadsheetId = SPREADSHEET_ID || '1wm5K1d9ScRhvLNYbSXhQuJjFnGr0jPrL0eJfn2bMYKM';  // <-- set your Sheet ID

  // 1. Insert a blank row at position 1 (below header row)
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      requests: [{
        insertDimension: {
          range: {
            sheetId: 0,         // assuming first sheet; adjust if needed
            dimension: "ROWS",
            startIndex: 1,
            endIndex: 2
          },
          inheritFromBefore: false
        }
      }]
    })
  });

  // 2. Write the job data into the new row (A2:F2)
  const values = [[company, link, referrer, recruiter, date, "No Action"]];
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:F2?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ values })
  });
}
