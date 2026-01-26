import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify ONLY when credentials exist
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("Email transporter error:", error.message);
    } else {
      console.log("Email transporter ready to send emails");
    }
  });
} else {
  console.warn(
    "Email not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env to enable email features."
  );
}

export default transporter;

