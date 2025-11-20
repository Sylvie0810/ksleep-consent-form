// Supabase Edge Function: send-consent-notification
// 이 코드를 Supabase Dashboard > Edge Functions에 붙여넣으세요

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = 're_5idJkR12_Aqne8skEWQiYjTfVsnGavcJ5'
const NOTIFICATION_EMAIL = 'sylvie.kim@ksleep.care'

serve(async (req) => {
  try {
    // Webhook에서 받은 데이터
    const { record } = await req.json()

    // KST로 시간 변환
    const utcDate = new Date(record.created_at)
    const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000))
    const kstTime = kstDate.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })

    // Resend API를 사용해 이메일 발송
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'K-Sleep Care <onboarding@resend.dev>',
        to: [NOTIFICATION_EMAIL],
        subject: `🔔 새로운 동의서 제출 - ${record.patient_name || record.name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
              .content { background: #f8f9fa; padding: 30px; margin: 20px 0; border-radius: 8px; }
              .info-row { margin: 15px 0; padding: 12px; background: white; border-radius: 6px; }
              .label { font-weight: bold; color: #667eea; }
              .value { color: #2d3748; margin-left: 10px; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 새로운 동의서가 제출되었습니다</h1>
                <p>케이슬립케어 개인정보 이용동의서</p>
              </div>

              <div class="content">
                <div class="info-row">
                  <span class="label">환자명:</span>
                  <span class="value">${record.patient_name || record.name}</span>
                </div>

                <div class="info-row">
                  <span class="label">생년:</span>
                  <span class="value">${record.patient_birth || record.birth}년생</span>
                </div>

                <div class="info-row">
                  <span class="label">제출 ID:</span>
                  <span class="value">#${record.id}</span>
                </div>

                <div class="info-row">
                  <span class="label">제출일시 (KST):</span>
                  <span class="value">${kstTime}</span>
                </div>

                <div class="info-row">
                  <span class="label">카카오톡 수신 동의:</span>
                  <span class="value">${record.kakao_channel_agreed ? '✓ 동의함' : '동의하지 않음'}</span>
                </div>

                ${record.guardian_name ? `
                <div class="info-row">
                  <span class="label">법정대리인:</span>
                  <span class="value">${record.guardian_name} (${record.guardian_relation || ''})</span>
                </div>
                ` : ''}

                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://ksleep-consent-form.vercel.app/admin.html" class="button">
                    관리자 대시보드에서 확인하기 →
                  </a>
                </div>
              </div>

              <div class="footer">
                <p><strong>수미헬스 (SOOMi Health)</strong></p>
                <p>케이슬립케어 | contact@ksleep.care</p>
                <p style="margin-top: 15px; opacity: 0.7;">
                  이 이메일은 동의서 제출 시 자동으로 발송됩니다.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const emailResult = await emailResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        emailId: emailResult.id
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})
