import nodemailer from "nodemailer";

export const sendEmail = async (to, otp) => {
  try {
    console.log("📤 Sending email to:", to);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vaibhavkhandelwal255@gmail.com",
        pass: "xwko xvrq cvvw tvaa",
      },
    });

    const info = await transporter.sendMail({
      from: "vaibhavkhandelwal255@gmail.com",
      to,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    console.log("✅ Email sent:", info.response);

  } catch (error) {
    console.error("❌ Email Error:", error);
  }
};