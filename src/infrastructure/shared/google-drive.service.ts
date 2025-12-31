import { injectable } from 'tsyringe';
import { google } from 'googleapis';
import { readFileSync, createReadStream, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IGoogleDriveService } from '../../domain/services/google-drive-service.interface';
import { config } from '../config';

@injectable()
export class GoogleDriveService implements IGoogleDriveService {
  private drive: any;
  private rootFolderName: string;
  private rootFolderId: string | null = null;
  private auth: any;
  private initialized: boolean = false;
  private monthFolderCache: Map<string, string> = new Map();

  constructor() {
    this.rootFolderName = process.env.GOOGLE_DRIVE_ROOT_FOLDER_NAME || 'database-backups';
  }

  private initializeDrive(): void {
    if (this.initialized) {
      return;
    }

    const credentialsPath = process.env.GOOGLE_DRIVE_OAUTH_CREDENTIALS || process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY;
    const tokenPath = process.env.GOOGLE_DRIVE_TOKEN_PATH || './credentials/google-drive-token.json';
    
    if (!credentialsPath) {
      throw new Error('GOOGLE_DRIVE_OAUTH_CREDENTIALS or GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY environment variable is required');
    }

    try {
      let credentials: any;
      try {
        const keyFile = readFileSync(credentialsPath, 'utf8');
        credentials = JSON.parse(keyFile);
      } catch (error: any) {
        throw new Error(`Failed to read OAuth credentials file: ${error.message}`);
      }

      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web || {};
      
      if (!client_id || !client_secret) {
        if (credentials.client_email && credentials.private_key) {
          throw new Error(
            'Service account authentication is not supported for personal Google accounts. ' +
            'Please use OAuth 2.0 credentials instead. See GOOGLE_DRIVE_SETUP.md for instructions.'
          );
        }
        throw new Error(
          'Invalid OAuth credentials file: missing client_id or client_secret. ' +
          'Please ensure you downloaded the OAuth 2.0 client credentials JSON file from Google Cloud Console.'
        );
      }

      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris?.[0] || 'http://localhost'
      );

      if (existsSync(tokenPath)) {
        try {
          const token = JSON.parse(readFileSync(tokenPath, 'utf8'));
          oAuth2Client.setCredentials(token);
        } catch (error: any) {
          throw new Error(`Failed to read token file: ${error.message}. Please re-authenticate.`);
        }
      } else {
        throw new Error(
          `Token file not found at ${tokenPath}. ` +
          `Please run the OAuth authentication flow to generate a token.json file. ` +
          `See GOOGLE_DRIVE_SETUP.md for instructions.`
        );
      }

      this.auth = oAuth2Client;
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.initialized = true;
    } catch (error: any) {
      throw new Error(`Failed to initialize Google Drive client: ${error.message}`);
    }
  }

  private async ensureAuth(): Promise<void> {
    if (!this.initialized) {
      this.initializeDrive();
    }
    
    if (this.auth) {
      const token = this.auth.credentials;
      if (!token || !token.access_token) {
        throw new Error('OAuth token is missing or invalid. Please re-authenticate.');
      }
      
      if (token.expiry_date && token.expiry_date <= Date.now()) {
        try {
          const { credentials } = await this.auth.refreshAccessToken();
          this.auth.setCredentials(credentials);
          
          const tokenPath = process.env.GOOGLE_DRIVE_TOKEN_PATH || './credentials/google-drive-token.json';
          setImmediate(() => {
            try {
              writeFileSync(tokenPath, JSON.stringify(credentials, null, 2));
            } catch (writeError) {
              console.error(`[GoogleDrive] Failed to write token file: ${writeError}`);
            }
          });
        } catch (error: any) {
          throw new Error(`Failed to refresh access token: ${error.message}. Please re-authenticate.`);
        }
      }
    }
  }

  async getRootFolderId(): Promise<string> {
    if (this.rootFolderId) {
      return this.rootFolderId;
    }

    await this.ensureAuth();

    const directFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (directFolderId && directFolderId.trim()) {
      this.rootFolderId = directFolderId.trim();
      return this.rootFolderId;
    }

    try {
      const response = await this.drive.files.list({
        q: `name='${this.rootFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files && response.data.files.length > 0) {
        const folderId = response.data.files[0].id;
        if (folderId && typeof folderId === 'string' && folderId.trim()) {
          this.rootFolderId = folderId.trim();
          return this.rootFolderId;
        }
      }

      throw new Error(
        `Root folder '${this.rootFolderName}' not found. ` +
        `Please create this folder in your Google Drive, or set GOOGLE_DRIVE_FOLDER_ID environment variable with the folder ID.`
      );
    } catch (error: any) {
      throw new Error(`Failed to get root folder: ${error.message}`);
    }
  }

  async ensureFolderExists(folderName: string, parentFolderId?: string): Promise<string> {
    await this.ensureAuth();

    try {
      const rootId = parentFolderId || await this.getRootFolderId();

      if (!rootId || !rootId.trim()) {
        throw new Error('Root folder ID is empty or invalid. Please set GOOGLE_DRIVE_FOLDER_ID environment variable.');
      }

      const cacheKey = `${rootId.trim()}-${folderName}`;
      if (this.monthFolderCache.has(cacheKey)) {
        return this.monthFolderCache.get(cacheKey)!;
      }

      const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${rootId.trim()}' in parents and trashed=false`;
      
      const response = await this.retryOperation<{ data: { files?: Array<{ id?: string; name?: string }> } }>(() =>
        this.drive.files.list({
          q: query,
          fields: 'files(id, name)',
          spaces: 'drive',
        })
      );

      if (response.data.files && response.data.files.length > 0) {
        const folderId = response.data.files[0].id;
        if (folderId) {
          this.monthFolderCache.set(cacheKey, folderId);
          return folderId;
        }
      }

      const createResponse = await this.retryOperation<{ data: { id?: string } }>(() =>
        this.drive.files.create({
          requestBody: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [rootId.trim()],
          },
          fields: 'id',
        })
      );

      if (!createResponse.data.id) {
        throw new Error('Failed to create folder: No ID returned');
      }

      this.monthFolderCache.set(cacheKey, createResponse.data.id);
      return createResponse.data.id;
    } catch (error: any) {
      throw new Error(`Failed to ensure folder exists: ${error.message}`);
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        if (attempt < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, attempt);
          console.warn(`[GoogleDrive] Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}):`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  async uploadFile(filePath: string, fileName: string, folderId: string): Promise<void> {
    await this.ensureAuth();

    if (!folderId || !folderId.trim()) {
      throw new Error('Folder ID is empty or invalid');
    }

    try {
      const fileMetadata = {
        name: fileName,
        parents: [folderId.trim()],
      };

      const media = {
        mimeType: 'application/gzip',
        body: createReadStream(filePath),
      };

      await this.retryOperation(() =>
        this.drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id',
        })
      );
    } catch (error: any) {
      throw new Error(`Failed to upload file to Google Drive: ${error.message}`);
    }
  }
}

