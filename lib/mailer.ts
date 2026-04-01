import "server-only";

import nodemailer from "nodemailer";
import {
  getPasswordResetEmailConfig,
  getPasswordResetTokenTtlMinutes,
} from "@/lib/server-env";

let transporter: nodemailer.Transporter | null = null;

export function canSendPasswordResetEmails() {
  return getPasswordResetEmailConfig() !== null;
}

function getTransporter() {
  const config = getPasswordResetEmailConfig();

  if (!config) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      auth: {
        pass: config.password,
        user: config.user,
      },
      host: config.host,
      port: config.port,
      secure: config.secure,
    });
  }

  return transporter;
}

export async function sendPasswordResetEmail(input: {
  email: string;
  name: string;
  resetUrl: string;
}) {
  const config = getPasswordResetEmailConfig();
  const activeTransporter = getTransporter();

  if (!config || !activeTransporter) {
    return false;
  }

  const ttlMinutes = getPasswordResetTokenTtlMinutes();

  await activeTransporter.sendMail({
    from: config.from,
    html: `
      <p>Hello ${input.name},</p>
      <p>We received a request to reset your GMT Homes password.</p>
      <p>This secure reset link will expire in ${ttlMinutes} minutes:</p>
      <p><a href="${input.resetUrl}">${input.resetUrl}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
    subject: "Reset your GMT Homes password",
    text: [
      `Hello ${input.name},`,
      "",
      "We received a request to reset your GMT Homes password.",
      `This secure reset link will expire in ${ttlMinutes} minutes:`,
      input.resetUrl,
      "",
      "If you did not request this, you can safely ignore this email.",
    ].join("\n"),
    to: input.email,
  });

  return true;
}
