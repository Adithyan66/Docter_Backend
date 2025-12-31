import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import * as readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = process.env.GOOGLE_DRIVE_TOKEN_PATH || './credentials/google-drive-token.json';
const CREDENTIALS_PATH = process.env.GOOGLE_DRIVE_OAUTH_CREDENTIALS || './credentials/google-drive-service-account.json';

async function getAccessToken(): Promise<void> {
  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web || {};

  if (!client_id || !client_secret) {
    throw new Error('Invalid OAuth credentials file. Missing client_id or client_secret.');
  }

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris?.[0] || 'http://localhost'
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token', err);
        return;
      }
      if (!token) {
        console.error('No token received');
        return;
      }
      oAuth2Client.setCredentials(token);
      writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
      console.log('Token stored to', TOKEN_PATH);
    });
  });
}

getAccessToken().catch(console.error);

