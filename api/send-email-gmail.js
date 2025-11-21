// Gmail SMTP를 사용한 이메일 발송 유틸리티

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    // Gmail SMTP 설정
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'urmypride@gmail.com',
        pass: 'kocd rsot jwhu zehb'
      }
    });

    // 이메일 발송
    const info = await transporter.sendMail({
      from: '"케이슬립케어 (K-Sleep Care)" <urmypride@gmail.com>',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Gmail SMTP error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
