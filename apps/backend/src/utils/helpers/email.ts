import sgMail from "@sendgrid/mail";
import { getEnvVariable } from "../../config";

sgMail.setApiKey(getEnvVariable("SENDGRID_API_KEY"));

interface MailerTemplateOptions {
  to: string;
  subject: string;
  html: string;
}

class Mailer {
  private readonly from = {
    name: "PraxisSync",
    email: "info@praxissync.com",
  };

  async sendVerificationEmail({ to, subject, html }: MailerTemplateOptions) {
    try {
      await sgMail.send({
        from: this.from,
        to,
        subject,
        html,
        text: "If you can’t view this message, please check your email client settings or open in a browser.",
      });

      console.log(`Verification email successfully sent to ${to}`);
    } catch (error) {
      console.error("❌ Unable to send verification email:", error);
      throw new Error("emailSendFailed");
    }
  }

  async sendOtpCode(to: string, otpCode: string) {
    const subject = "Your PraxisSync One-Time Verification Code";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>PraxisSync Verification</h2>
        <p>Use the code below to verify your account. Please do not share it with anyone.</p>
        <h1 style="letter-spacing: 4px; background-color: #f4f4f4; padding: 10px; display: inline-block;">${otpCode}</h1>
        <p>This code will expire in <strong>5 minutes</strong>.</p>
      </div>
    `;
    return this.sendVerificationEmail({ to, subject, html });
  }
}

export const mailer = new Mailer();
