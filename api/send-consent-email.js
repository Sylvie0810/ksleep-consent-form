// Vercel Serverless Function - 동의서 이메일 발송 (Gmail SMTP)

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, birthYear, consentLink } = req.body;

    // Gmail SMTP 설정
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'urmypride@gmail.com',
        pass: 'kocd rsot jwhu zehb'
      }
    });

    const emailHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px; }
              .content { background: #f8f9fa; padding: 30px; margin: 20px 0; border-radius: 8px; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>개인정보 이용동의서</h1>
                <p>케이슬립케어 (수미헬스)</p>
              </div>

              <div class="content">
                <h2 style="color: #2d3748; margin-bottom: 15px;">안녕하세요, ${name}님</h2>
                <p style="font-size: 15px; line-height: 1.8;">
                  케이슬립케어 프로그램 참여를 위한 <strong>개인정보 및 민감정보 수집·이용 동의서</strong> 작성을 부탁드립니다.
                </p>

                <div class="info-box">
                  <p style="margin-bottom: 10px;">📝 <strong>작성 방법</strong></p>
                  <ol style="margin-left: 20px; color: #4a5568;">
                    <li>아래 버튼을 클릭하여 동의서 페이지로 이동합니다</li>
                    <li>이미 입력된 정보를 확인합니다 (${name}, ${birthYear}년생)</li>
                    <li>동의 내용을 검토한 후 서명을 작성합니다</li>
                    <li>제출 버튼을 누르면 완료됩니다</li>
                  </ol>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${consentLink}" class="button">
                    동의서 작성하러 가기 →
                  </a>
                </div>

                <p style="font-size: 13px; color: #6c757d; margin-top: 20px;">
                  ⏱️ 소요 시간: 약 2-3분<br>
                  📱 모바일에서도 작성 가능합니다
                </p>
              </div>

              <div class="footer">
                <p><strong>수미헬스 (SOOMi Health)</strong></p>
                <p>케이슬립케어 | contact@ksleep.care | 010-9796-2513</p>
                <p style="margin-top: 15px; opacity: 0.7;">
                  본 이메일은 케이슬립케어 프로그램 참여를 위해 발송되었습니다.<br>
                  문의사항이 있으시면 위 연락처로 연락 주시기 바랍니다.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
    `;

    // 이메일 발송
    const info = await transporter.sendMail({
      from: '"케이슬립케어 (K-Sleep Care)" <urmypride@gmail.com>',
      to: email,
      subject: `[케이슬립케어] ${name}님, 개인정보 이용동의서 작성을 부탁드립니다`,
      html: emailHTML
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
