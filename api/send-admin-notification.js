// Vercel Serverless Function - 관리자 알림 이메일 발송

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
    const { patientName, patientBirth, patientEmail, kakaoConsent } = req.body;

    const RESEND_API_KEY = 're_5idJkR12_Aqne8skEWQiYjTfVsnGavcJ5';

    // KST 시간 생성
    const utcDate = new Date();
    const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000));
    const currentDate = kstDate.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const adminEmailHTML = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>새로운 동의서 제출 알림</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
            background: #f8f9fa;
            padding: 40px 20px;
            line-height: 1.6;
        }
        .container { max-width: 600px; margin: 0 auto; background: white; border: 2px solid #2d3748; border-radius: 8px; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 6px 6px 0 0;
        }
        .header h1 { font-size: 24px; margin-bottom: 8px; font-weight: 700; }
        .header .subtitle { font-size: 14px; opacity: 0.95; }
        .content { padding: 30px; }
        .alert-box {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            text-align: center;
        }
        .alert-box h2 { color: #856404; font-size: 20px; margin-bottom: 10px; }
        .info-grid {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 12px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info-label { font-weight: 700; color: #495057; }
        .info-value { color: #2d3748; font-weight: 500; }
        .button-container { text-align: center; margin: 30px 0; }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            border-radius: 0 0 6px 6px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 새로운 동의서 제출</h1>
            <div class="subtitle">케이슬립케어 관리자 알림</div>
        </div>

        <div class="content">
            <div class="alert-box">
                <h2>새로운 동의서가 제출되었습니다</h2>
                <p style="color: #856404; font-size: 14px;">제출 시각: ${currentDate}</p>
            </div>

            <div class="info-grid">
                <div class="info-label">환자명</div>
                <div class="info-value">${patientName}</div>
                <div class="info-label">생년</div>
                <div class="info-value">${patientBirth}년생</div>
                <div class="info-label">이메일</div>
                <div class="info-value">${patientEmail}</div>
                <div class="info-label">카카오톡 동의</div>
                <div class="info-value">${kakaoConsent ? '동의함 ✓' : '동의하지 않음'}</div>
            </div>

            <div class="button-container">
                <a href="https://ksleep-consent-form.vercel.app/admin.html" class="btn">
                    관리자 대시보드에서 확인하기 →
                </a>
            </div>

            <p style="font-size: 13px; color: #6c757d; text-align: center; margin-top: 20px;">
                환자에게는 동의서 확인서가 자동으로 이메일로 발송되었습니다.
            </p>
        </div>

        <div class="footer">
            <p><strong>수미헬스(SOOMi Health)</strong></p>
            <p>케이슬립케어 | contact@ksleep.care</p>
            <p style="margin-top: 10px; opacity: 0.7;">
                이 메일은 동의서 제출 시 자동으로 발송되는 알림입니다.
            </p>
        </div>
    </div>
</body>
</html>`;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'K-Sleep Care <onboarding@resend.dev>',
        to: ['sylvie.kim@ksleep.care'],
        subject: `[케이슬립케어] 새로운 동의서 제출 - ${patientName}`,
        html: adminEmailHTML
      })
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await emailResponse.json();

    return res.status(200).json({
      success: true,
      emailId: result.id
    });

  } catch (error) {
    console.error('Admin notification email error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
