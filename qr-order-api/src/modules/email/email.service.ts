import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    // Configuration du transporteur email
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendTeamMemberInvitation(
    email: string,
    name: string,
    password: string,
    restaurantName: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `"${this.configService.get('APP_NAME', 'QR Order')}" <${this.configService.get('SMTP_FROM', this.configService.get('SMTP_USER'))}>`,
        to: email,
        subject: `Bienvenue dans l'équipe ${restaurantName} - QR Order`,
        html: this.getInvitationEmailTemplate(name, password, restaurantName),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email d'invitation envoyé à ${email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email à ${email}:`, error);
      // On ne lance pas d'exception pour ne pas bloquer la création du membre
      // L'admin pourra toujours envoyer le mot de passe manuellement
    }
  }

  async sendPasswordReset(
    email: string,
    name: string,
    temporaryPassword: string,
    restaurantName: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `"${this.configService.get('APP_NAME', 'QR Order')}" <${this.configService.get('SMTP_FROM', this.configService.get('SMTP_USER'))}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe - QR Order',
        html: this.getPasswordResetEmailTemplate(name, temporaryPassword, restaurantName),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de réinitialisation envoyé à ${email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email à ${email}:`, error);
    }
  }

  private getInvitationEmailTemplate(
    name: string,
    password: string,
    restaurantName: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #d94a6a 0%, #e76f8c 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .password-box {
              background: white;
              border: 2px solid #d94a6a;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .password {
              font-size: 24px;
              font-weight: bold;
              color: #d94a6a;
              letter-spacing: 2px;
              font-family: monospace;
            }
            .button {
              display: inline-block;
              background: #d94a6a;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Bienvenue dans l'équipe !</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${name}</strong>,</p>
            
            <p>Vous avez été invité(e) à rejoindre l'équipe de <strong>${restaurantName}</strong> sur la plateforme QR Order.</p>
            
            <p>Voici vos identifiants de connexion :</p>
            
            <div class="password-box">
              <p style="margin: 0 0 10px 0; color: #666;">Mot de passe temporaire</p>
              <div class="password">${password}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important :</strong> Pour des raisons de sécurité, veuillez changer ce mot de passe dès votre première connexion.
            </div>
            
            <p style="text-align: center;">
              <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/login" class="button">
                Se connecter maintenant
              </a>
            </p>
            
            <p>Si vous avez des questions, n'hésitez pas à contacter votre responsable.</p>
            
            <p>À bientôt,<br>L'équipe QR Order</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>&copy; ${new Date().getFullYear()} QR Order. Tous droits réservés.</p>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(
    name: string,
    temporaryPassword: string,
    restaurantName: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .password-box {
              background: white;
              border: 2px solid #667eea;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .password {
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 2px;
              font-family: monospace;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${name}</strong>,</p>
            
            <p>Votre mot de passe a été réinitialisé par un administrateur de <strong>${restaurantName}</strong>.</p>
            
            <p>Voici votre nouveau mot de passe temporaire :</p>
            
            <div class="password-box">
              <p style="margin: 0 0 10px 0; color: #666;">Mot de passe temporaire</p>
              <div class="password">${temporaryPassword}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important :</strong> Veuillez changer ce mot de passe dès votre prochaine connexion pour des raisons de sécurité.
            </div>
            
            <p style="text-align: center;">
              <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/login" class="button">
                Se connecter
              </a>
            </p>
            
            <p>Si vous n'êtes pas à l'origine de cette demande, contactez immédiatement votre responsable.</p>
            
            <p>Cordialement,<br>L'équipe QR Order</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>&copy; ${new Date().getFullYear()} QR Order. Tous droits réservés.</p>
          </div>
        </body>
      </html>
    `;
  }
}
