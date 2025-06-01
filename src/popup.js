// import { ref, get } from "firebase/database";
// import { database } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
  const companyInput = document.getElementById('company');
  const linkInput = document.getElementById('link');
  const referrerInput = document.getElementById('referrer');
  const recruiterInput = document.getElementById('recruiter');
  const dateInput = document.getElementById('date');

  // Prefill link and date
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    linkInput.value = tabs[0]?.url || '';
  });
  const today = new Date();
  dateInput.value = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

  // Fetch company data from Firebase Realtime DB REST API
  async function fetchCompanyData(company) {
    const databaseURL = 'https://ngl-job-board-d5bd8-default-rtdb.firebaseio.com';
    const url = `${databaseURL}/companies/${encodeURIComponent(company)}.json`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (err) {
      console.error('Firebase REST fetch error:', err);
      return null;
    }
  }

  companyInput.addEventListener('change', async () => {
    const company = companyInput.value.trim();
    if (!company) return;
    const data = await fetchCompanyData(company);
    if (data) {
      if (data.referrers) {
        const firstRef = Object.values(data.referrers)[0];
        referrerInput.value = firstRef.name || '';
      }
      if (data.recruiters) {
        const firstRec = Object.values(data.recruiters)[0];
        recruiterInput.value = firstRec.name || '';
      }
    }
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
      companyInput.value = '';
      referrerInput.value = '';
      recruiterInput.value = '';
    } catch (e) {
      console.error(e);
      alert('Error adding job: ' + e.message);
    }
  });

  // Report Employee button
  document.getElementById('goReport').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
  });
});

// Uses Google Sheets API to insert a new row at top (row 2) and fill it atomically
async function insertJobToSheet(company, link, referrer, recruiter, date) {
  // Get OAuth token (interactive)
  const token = await new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(new Error(chrome.runtime.lastError?.message || 'Auth failed'));
      } else {
        resolve(token);
      }
    });
  });

  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
  };

  const spreadsheetId = SPREADSHEET_ID || '1wm5K1d9ScRhvLNYbSXhQuJjFnGr0jPrL0eJfn2bMYKM'; // your Sheet ID

  const body = {
    requests: [
      {
        insertDimension: {
          range: {
            sheetId: 0, // first sheet; adjust if needed
            dimension: 'ROWS',
            startIndex: 1,
            endIndex: 2,
          },
          inheritFromBefore: false,
        },
      },
      {
        updateCells: {
          start: {
            sheetId: 0,
            rowIndex: 1,
            columnIndex: 0,
          },
          rows: [
            {
              values: [
                { userEnteredValue: { stringValue: company } },
                { userEnteredValue: { stringValue: link } },
                { userEnteredValue: { stringValue: referrer } },
                { userEnteredValue: { stringValue: recruiter } },
                { userEnteredValue: { stringValue: date } },
                { userEnteredValue: { stringValue: 'No Action' } },
              ],
            },
          ],
          fields: 'userEnteredValue',
        },
      },
    ],
  };

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Sheets API error: ${errorData.error.message}`);
  }
}
