![Static Badge](https://img.shields.io/badge/LICENSE-ISC-orange)
![Static Badge](https://img.shields.io/badge/STATUS-BUILD_SUCCESS-green)

<br />
<style>
@media (prefers-color-scheme: dark) {
    .themed-border {
        border-color: white !important;
    }
}
@media (prefers-color-scheme: light) {
    .themed-border {
        border-color: black !important;
    }
}
</style>
<div align="center" class="themed-border" style="border-style: solid; border-width: 1px;">
    
<h3 align="center"><image align="center" src="icons/icon48.png" style="width: 60px"/> ngl-job-board</h3>
  <p align="center">
    Pop-up for job quick and shared job posting
    <br />
    <a href="https://github.com/dmtrung14-misc/ngl-job">GitHub</a>
    <a href="https://github.com/dmtrung14-misc/ngl-job/issues">Report Bug</a>
  </p>
</div>

## 1. Installation
Install `node.js`, then run:
```bash
npm init
npm install
```

Install firebase CLI
```bash
npm install -g firebase-tools
```

## 2. Setting up
### 2.1 Google Cloud Platform (GCP)
Create a GCP project. Then go to API & Services > Credentials, create a OAuth 2.0 credential of type Chrome Extension.

### 2.2 Google Sheet
Then, create a Google Sheet with the following fields, in order:

| Company 	| Link 	| Referrer 	| Recruiter 	| Date 	| Status 	|
|---	|---	|---	|---	|---	|---	|

Then, populate the last column ("Status") with a drop down of at least one choice called "No Action"

### 2.3 `.env`
Then, create a `.env` file, then add the following items:
```conf
GOOGLE_CLIENT_ID= <GCP client id>
SPREADSHEET_ID= <the part behind '/d/' on Google Sheet>
```

## 3. Deployment
First, build the app into a static folder using:
```
npm run build
```
this will create a `/dist` folder in the same directory.

Then, go to `chrome://extensions` -> Turn on developer mode -> Load Unpacked -> Select the `dist` folder.

The extension should now be ready for usage.

## 3. Features
- [x] Add custom jobs to any Google Sheets
- [x] Global storage of Referrers
- [x] Autofilling job Link
- [x] Autofilling connection info
- [ ] Isolation of Firebase Database (via `.env` variable)
- [ ] Dynamic addition of job board links
- [ ] Autofilling Company Name

### 4. Contributions
Contributions are welcomed. The product, however, is delivered as is. Further supports will NOT be provided.
