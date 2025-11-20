// Vercel Serverless Function - 동의서 확인서 이메일 발송

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
    const { email, name, birthYear, signatureData, kakaoConsent, guardianName, guardianPhone, guardianRelation } = req.body;

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

    const age = new Date().getFullYear() - parseInt(birthYear);
    const isMinor = age < 14;

    const fullConsentHTML = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>개인정보 수집·이용 동의서 - ${name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
            background: #ffffff;
            padding: 40px 20px;
            line-height: 1.6;
        }
        .container { max-width: 900px; margin: 0 auto; background: white; border: 2px solid #2d3748; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 4px solid #2d3748;
        }
        .header h1 { font-size: 28px; margin-bottom: 12px; font-weight: 700; }
        .header .subtitle { font-size: 16px; opacity: 0.95; font-weight: 500; }
        .content { padding: 40px 30px; }
        .section { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
        .section:last-child { border-bottom: none; }
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 15px;
            padding-left: 12px;
            border-left: 4px solid #667eea;
        }
        .section-content { font-size: 14px; color: #4a5568; line-height: 1.8; }
        .section-content ul { margin: 10px 0; padding-left: 25px; }
        .section-content li { margin: 8px 0; }
        .info-grid {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 12px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 15px 0;
        }
        .info-label { font-weight: 700; color: #495057; }
        .info-value { color: #2d3748; font-weight: 500; }
        .signature-box {
            background: #f8f9fa;
            border: 2px solid #cbd5e0;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin: 20px 0;
        }
        .signature-box h3 { font-size: 16px; color: #2d3748; margin-bottom: 15px; font-weight: 700; }
        .signature-image { max-width: 400px; border: 2px solid #cbd5e0; padding: 15px; background: white; border-radius: 8px; }
        .consent-status {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 18px;
            font-weight: 700;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            background: #2d3748;
            color: white;
            padding: 30px;
            text-align: center;
            font-size: 13px;
        }
        .footer p { margin: 5px 0; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>개인정보 및 민감정보 수집·이용 동의서</h1>
            <div class="subtitle">케이슬립케어 (수미헬스)</div>
        </div>

        <div class="content">
            <div class="consent-status">
                ✓ 동의 완료 (${currentDate})
            </div>

            <div class="section">
                <div class="section-title">동의자 정보</div>
                <div class="info-grid">
                    <div class="info-label">성명</div>
                    <div class="info-value">${name}</div>
                    <div class="info-label">생년</div>
                    <div class="info-value">${birthYear}년생</div>
                    <div class="info-label">연령</div>
                    <div class="info-value">${age}세</div>
                    ${isMinor && guardianName ? `
                    <div class="info-label">법정대리인</div>
                    <div class="info-value">${guardianName} (${guardianRelation || '관계 미입력'})</div>
                    <div class="info-label">대리인 연락처</div>
                    <div class="info-value">${guardianPhone}</div>
                    ` : ''}
                    <div class="info-label">카카오톡 수신 동의</div>
                    <div class="info-value">${kakaoConsent ? '동의함 ✓' : '동의하지 않음'}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">1. 수집·이용 목적</div>
                <div class="section-content">
                    <strong>수면무호흡증 진단 및 치료 지원</strong>
                    <ul>
                        <li>PSG(수면다원검사) 결과 확인 및 해석 지원</li>
                        <li>양압기 및 기타 치료 계획 수립 및 조정</li>
                        <li>Mask fit 평가 및 마스크 선택·교체 지원</li>
                        <li>양압기 titration 데이터 확인 및 최적 압력 조정 지원</li>
                        <li>양압기 사용 현황 모니터링 및 순응도 관리</li>
                    </ul>
                    <strong>맞춤형 케어·교육 제공</strong>
                    <ul>
                        <li>검사·치료 데이터를 기반으로 한 맞춤형 설명·리포트 제공</li>
                        <li>수면·수면무호흡증·치료·보험 관련 안내 및 Q&A 지원</li>
                    </ul>
                    <strong>서비스 품질관리 및 개선</strong>
                    <ul>
                        <li>치료 순응도 및 증상 개선 데이터 분석</li>
                        <li>내부 통계·분석을 통한 프로그램·서비스 개선</li>
                    </ul>
                </div>
            </div>

            <div class="section">
                <div class="section-title">2. 수집·이용 항목</div>
                <div class="section-content">
                    <strong>[1] 일반 개인정보</strong>
                    <ul>
                        <li>성명, 생년월일, 성별</li>
                        <li>연락처(휴대전화 번호, 이메일)</li>
                        <li>병원 고객번호 등 프로그램 운영에 필요한 식별 정보</li>
                    </ul>
                    <strong>[2] 건강 관련 민감정보</strong>
                    <ul>
                        <li>PSG(수면다원검사) 결과 전반</li>
                        <li>양압기 및 관련 검사/설정 데이터</li>
                        <li>실제 양압기 사용 데이터</li>
                        <li>수면 관련 설문 및 기록</li>
                    </ul>
                </div>
            </div>

            <div class="section">
                <div class="section-title">3. 보유·이용 기간</div>
                <div class="section-content">
                    <ul>
                        <li>케이슬립케어 프로그램 참여 기간 동안 및 참여 종료 후 <strong>5년간</strong> 보관</li>
                        <li>관련 법령에 따라 더 긴 기간 보존이 필요한 경우, 해당 법령에서 정한 기간 동안 보관·이용</li>
                    </ul>
                </div>
            </div>

            <div class="section">
                <div class="section-title">4. 제3자 제공</div>
                <div class="section-content">
                    <strong>1) 진료 및 프로그램 운영을 위한 제공</strong>
                    <ul>
                        <li><strong>제공 대상:</strong> 고객이 검사·진료를 받은 수면클리닉 또는 병원, 치료기기 및 소모품 공급사(DME) 등</li>
                        <li><strong>제공 목적:</strong> 진단·치료·검사 및 프로그램 운영, 장비 세팅·유지관리, 기술 지원 등</li>
                        <li><strong>제공 항목:</strong> 업무 수행에 필요한 최소한의 범위</li>
                    </ul>
                </div>
            </div>

            <div class="section">
                <div class="section-title">5. 정보주체의 권리</div>
                <div class="section-content">
                    <p>귀하는 언제든지 다음 사항에 대해 수미헬스에 요구할 수 있습니다:</p>
                    <ul>
                        <li>개인정보 및 민감정보 열람</li>
                        <li>정정·삭제 요청</li>
                        <li>처리 정지 요청</li>
                    </ul>
                    <p style="margin-top: 10px;">연락처: contact@ksleep.care / 010-9796-2513</p>
                </div>
            </div>

            <div class="signature-box">
                <h3>전자 서명</h3>
                ${signatureData ? `<img src="${signatureData}" alt="서명" class="signature-image" />` : '<p>서명 없음</p>'}
                <p style="margin-top: 15px; font-size: 13px; color: #6c757d;">서명일: ${currentDate}</p>
            </div>
        </div>

        <div class="footer">
            <p><strong>수미헬스(SOOMi Health)</strong></p>
            <p>서비스명: 케이슬립케어 | 사업자등록번호: 889-43-01165</p>
            <p>대표자명·개인정보보호책임자: 김연재</p>
            <p>주소: 서울특별시 영등포구 양평로 24, 5층 (Korea)</p>
            <p>이메일: contact@ksleep.care | 전화: 010-9796-2513</p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                Copyright© 2025 수미헬스 All rights reserved
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
        to: [email],
        subject: `[케이슬립케어] ${name}님, 동의서 제출이 완료되었습니다`,
        html: fullConsentHTML
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
    console.error('Confirmation email sending error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
