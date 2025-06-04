// utils/sendEmail.ts
import nodemailer from "nodemailer";

export const sendOtpEmail = async (email: string, code: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: "ceo@bthwani.com",
      pass: "JvUEVSM0+4", // 🔐 أدخل كلمة مرور البريد هنا
    },
  });

  const mailOptions = {
    from: '"منصة بثواني 🚀" <ceo@bthwani.com>',
    to: email,
    subject: "رمز التحقق - بثواني",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>رمز التحقق الخاص بك</h2>
        <p>مرحباً،</p>
        <p>رمز التحقق الخاص بك هو:</p>
        <h3 style="color: #D84315;">${code}</h3>
        <p>تنتهي صلاحية هذا الرمز خلال 5 دقائق.</p>
        <br />
        <p>مع تحيات،<br/>فريق بثواني</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
