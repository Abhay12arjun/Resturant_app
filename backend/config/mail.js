const nodemailer = require("nodemailer");

const requestTimeout = Number(process.env.EMAIL_REQUEST_TIMEOUT) || 20000;

const fetchWithTimeout = async (url, options) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const sendWithBrevo = async (options) => {
  const response = await fetchWithTimeout("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.EMAIL_FROM_NAME || "FoodApp",
        email: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: [{ email: options.email }],
      subject: options.subject,
      htmlContent: options.message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo email failed (${response.status}): ${errorText}`);
  }
};

const sendWithResend = async (options) => {
  const response = await fetchWithTimeout("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${process.env.EMAIL_FROM_NAME || "FoodApp"} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: [options.email],
      subject: options.subject,
      html: options.message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${errorText}`);
  }
};

const sendWithSmtp = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing");
  }

  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT) || 465;
  const secure =
    process.env.EMAIL_SECURE === undefined
      ? port === 465
      : process.env.EMAIL_SECURE === "true";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.replace(/\s/g, ""),
    },
  });

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || "FoodApp"} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

const sendEmail = async (options) => {
  if (process.env.BREVO_API_KEY) {
    return sendWithBrevo(options);
  }

  if (process.env.RESEND_API_KEY) {
    return sendWithResend(options);
  }

  return sendWithSmtp(options);
};

module.exports = sendEmail;
