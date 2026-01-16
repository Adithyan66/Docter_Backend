import nodemailer from 'nodemailer';
import { config } from '../config';

export class EmailNotificationService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (config.email.enabled) {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure,
        auth: {
          user: config.email.smtp.user,
          pass: config.email.smtp.password,
        },
      });
    }
  }

  async sendBackupFailureNotification(
    error: Error,
    attempt: number,
    maxRetries: number,
    timestamp: Date
  ): Promise<void> {
    if (!config.email.enabled || !this.transporter) {
      console.warn('[Email] Email notifications are disabled');
      return;
    }

    const subject = `[Backup Failed] Database Backup Failed - Attempt ${attempt}/${maxRetries}`;
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f;">Database Backup Failed</h2>
            <p><strong>Timestamp:</strong> ${timestamp.toISOString()}</p>
            <p><strong>Attempt:</strong> ${attempt} of ${maxRetries}</p>
            <p><strong>Error Message:</strong></p>
            <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto;">${error.message}</pre>
            ${error.stack ? `<p><strong>Stack Trace:</strong></p><pre style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${error.stack}</pre>` : ''}
            <p style="margin-top: 20px; color: #666;">
              Please investigate the backup process and ensure MongoDB and Google Drive services are accessible.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
Database Backup Failed

Timestamp: ${timestamp.toISOString()}
Attempt: ${attempt} of ${maxRetries}

Error Message:
${error.message}

${error.stack ? `Stack Trace:\n${error.stack}` : ''}

Please investigate the backup process and ensure MongoDB and Google Drive services are accessible.
    `;

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: config.email.to.join(', '),
        subject,
        text,
        html,
      });
      console.log(`[Email] Backup failure notification sent to ${config.email.to.join(', ')}`);
    } catch (emailError: any) {
      console.error('[Email] Failed to send backup failure notification:', emailError.message);
    }
  }

  async sendBackupSuccessNotification(
    backupFileName: string,
    fileSizeMB: number,
    timestamp: Date
  ): Promise<void> {
    if (!config.email.enabled || !this.transporter) {
      return;
    }

    const subject = `[Backup Success] Database Backup Completed Successfully`;
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2e7d32;">Database Backup Completed Successfully</h2>
            <p><strong>Timestamp:</strong> ${timestamp.toISOString()}</p>
            <p><strong>Backup File:</strong> ${backupFileName}</p>
            <p><strong>File Size:</strong> ${fileSizeMB.toFixed(2)} MB</p>
            <p style="margin-top: 20px; color: #666;">
              The backup has been successfully uploaded to Google Drive.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
Database Backup Completed Successfully

Timestamp: ${timestamp.toISOString()}
Backup File: ${backupFileName}
File Size: ${fileSizeMB.toFixed(2)} MB

The backup has been successfully uploaded to Google Drive.
    `;

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: config.email.to.join(', '),
        subject,
        text,
        html,
      });
      console.log(`[Email] Backup success notification sent to ${config.email.to.join(', ')}`);
    } catch (emailError: any) {
      console.error('[Email] Failed to send backup success notification:', emailError.message);
    }
  }
}

