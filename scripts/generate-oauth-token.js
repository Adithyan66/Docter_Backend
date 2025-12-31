"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const fs_1 = require("fs");
const readline = __importStar(require("readline"));
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = process.env.GOOGLE_DRIVE_TOKEN_PATH || './credentials/google-drive-token.json';
const CREDENTIALS_PATH = process.env.GOOGLE_DRIVE_OAUTH_CREDENTIALS || './credentials/google-drive-service-account.json';
async function getAccessToken() {
    const credentials = JSON.parse((0, fs_1.readFileSync)(CREDENTIALS_PATH, 'utf-8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web || {};
    if (!client_id || !client_secret) {
        throw new Error('Invalid OAuth credentials file. Missing client_id or client_secret.');
    }
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris?.[0] || 'http://localhost');
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
            (0, fs_1.writeFileSync)(TOKEN_PATH, JSON.stringify(token, null, 2));
            console.log('Token stored to', TOKEN_PATH);
        });
    });
}
getAccessToken().catch(console.error);
