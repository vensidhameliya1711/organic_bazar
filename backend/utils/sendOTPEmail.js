import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `Organic Bazar <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial">
        <h2>Password Reset OTP</h2>
        <h1 style="color:red">${otp}</h1>
        <p>This OTP is valid for 10 minutes</p>
      </div>
    `
  });

};
