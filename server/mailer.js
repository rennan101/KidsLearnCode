/**
 * mailer.js
 * Sistema de envio de e-mails via SMTP próprio (100% gratuito)
 * Suporta Ativação de Conta, Validação de Menores (ECA) e Recuperação de Senha.
 */

import nodemailer from 'nodemailer';

export class Mailer {
  constructor(config = {}) {
    this.enabled = config.SMTP_ENABLED === 'true' || config.SMTP_ENABLED === true;
    this.from = config.SMTP_FROM || '"Ilha Lua - KidsLearnCode" <no-reply@kidslearncode.local>';
    this.publicUrl = config.PUBLIC_URL || 'http://localhost:8080';

    if (this.enabled && config.SMTP_HOST && config.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: parseInt(config.SMTP_PORT || '587', 10),
        secure: config.SMTP_SECURE === 'true' || config.SMTP_PORT === '465',
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log(`[Mailer] Servidor SMTP configurado via ${config.SMTP_HOST}:${config.SMTP_PORT}`);
    } else {
      this.transporter = null;
      console.log('[Mailer] Modo de envio direto simulado (SMTP desativado no .env). Links serão exibidos no console do servidor.');
    }
  }

  async sendConfirmationEmail({ email, token, nickname = 'Aventureiro', isMinor = false, parentEmail = null }) {
    const confirmationLink = `${this.publicUrl}/api/auth/confirm-email?token=${token}`;
    const targetEmail = isMinor && parentEmail ? parentEmail : email;

    const subject = isMinor 
      ? `[Ilha Lua] Autorização de Acesso para o Aventureiro ${nickname}` 
      : `[Ilha Lua] Confirme seu cadastro no KidsLearnCode!`;

    const html = `
      <div style="font-family: 'Nunito', Arial, sans-serif; background-color: #f8f8f0; padding: 30px; color: #794f27;">
        <div style="max-width: 540px; margin: 0 auto; background: #fdfbf7; border: 2px solid #7a583e; border-radius: 20px; padding: 24px; box-shadow: 0 6px 0 #5c3c26;">
          <h2 style="color: #794f27; margin-top: 0; text-align: center; font-size: 24px;">Bem-vindo à Ilha Lua!</h2>
          <p style="font-size: 16px; line-height: 1.6;">Olá, <strong>${nickname}</strong>!</p>
          ${isMinor ? `
            <div style="background: #e6f9f6; border-left: 4px solid #19c8b9; padding: 12px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; font-size: 14px; color: #0f8e83;">
                <strong>Aviso aos Pais/Responsáveis:</strong> Este e-mail foi solicitado para liberar o acesso educativo e seguro da criança à plataforma interativa KidsLearnCode, em total conformidade com o ECA.
              </p>
            </div>
          ` : ''}
          <p style="font-size: 15px; line-height: 1.6;">
            Clique no botão abaixo para ativar a sua jornada e salvar seus mapas, construções e dragões no mundo:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${confirmationLink}" style="background-color: #19c8b9; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 50px; display: inline-block; box-shadow: 0 4px 0 #0f8e83;">
              Ativar Minha Conta
            </a>
          </div>
          <p style="font-size: 12px; color: #8a7b66; text-align: center;">
            Ou copie o link no navegador: <br><a href="${confirmationLink}" style="color: #0f8e83;">${confirmationLink}</a>
          </p>
        </div>
      </div>
    `;

    return this._dispatchEmail(targetEmail, subject, html, confirmationLink);
  }

  async sendPasswordResetEmail({ email, token, nickname = 'Aventureiro', publicUrl = null }) {
    const rootUrl = publicUrl || this.publicUrl || 'http://localhost:8080';
    const resetLink = `${rootUrl.replace(/\/$/, '')}/api/auth/reset-password?token=${encodeURIComponent(token)}`;
    const subject = `[Ilha Lua] Recuperação de Senha`;

    const html = `
      <div style="font-family: 'Nunito', Arial, sans-serif; background-color: #f8f8f0; padding: 30px; color: #794f27;">
        <div style="max-width: 540px; margin: 0 auto; background: #fdfbf7; border: 2px solid #7a583e; border-radius: 20px; padding: 28px 24px; box-shadow: 0 6px 0 #5c3c26;">
          <h2 style="color: #794f27; margin-top: 0; text-align: center; font-size: 24px;">Recuperação de Senha</h2>
          <p style="font-size: 16px; line-height: 1.6;">Olá, <strong>${nickname}</strong>!</p>
          <p style="font-size: 15px; line-height: 1.6;">
            Recebemos um pedido para redefinir a senha da sua conta na Ilha Lua. Se foi você, clique no botão abaixo para cadastrar uma nova senha:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" style="background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 50px; display: inline-block; box-shadow: 0 4px 0 #9a3412;">
              Redefinir Minha Senha
            </a>
          </div>
          <p style="font-size: 13px; color: #725d42;">Este link é válido por <strong>1 hora</strong>. Se você não pediu a redefinição, apenas desconsidere esta mensagem.</p>
          <p style="font-size: 12px; color: #8a7b66; text-align: center;">
            Link direto: <br><a href="${resetLink}" style="color: #ea580c;">${resetLink}</a>
          </p>
        </div>
      </div>
    `;

    return this._dispatchEmail(email, subject, html, resetLink);
  }

  async _dispatchEmail(to, subject, html, directLink) {
    if (this.transporter && this.enabled) {
      try {
        const info = await this.transporter.sendMail({
          from: this.from,
          to,
          subject,
          html
        });
        console.log(`[Mailer] E-mail enviado com sucesso para ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        console.error(`[Mailer] Erro ao disparar via SMTP para ${to}:`, err.message);
        return { success: false, error: err.message, link: directLink };
      }
    } else {
      console.log(`\n======================================================`);
      console.log(`📧 [SIMULAÇÃO DE E-MAIL - SMTP DESATIVADO]`);
      console.log(`Para: ${to}`);
      console.log(`Assunto: ${subject}`);
      console.log(`Link de Ação: ${directLink}`);
      console.log(`======================================================\n`);
      return { success: true, simulated: true, link: directLink };
    }
  }
}
