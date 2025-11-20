# 이메일 알림 설정 가이드

동의서가 제출될 때마다 `sylvie.kim@ksleep.care`로 자동 이메일 알림을 받는 방법입니다.

## 1단계: Supabase Edge Function 생성

### 1.1 Supabase Dashboard 접속
https://supabase.com/dashboard/project/clljgqrbqwexqhketdcu

### 1.2 Edge Function 만들기
1. 좌측 메뉴에서 **Edge Functions** 클릭
2. **Create a new function** 버튼 클릭
3. Function name: `send-consent-notification` 입력
4. 아래의 코드 전체를 복사해서 붙여넣기

**코드는 `edge-function-code.ts` 파일을 참고하세요**

### 1.3 Deploy
- **Deploy function** 버튼 클릭
- 배포 완료까지 약 30초 소요

---

## 2단계: Database Webhook 설정

### 2.1 Database Webhooks 메뉴 이동
1. Supabase Dashboard 좌측 메뉴에서 **Database** 클릭
2. 하위 메뉴에서 **Webhooks** 선택
3. **Create a new hook** 또는 **Enable Webhooks** 버튼 클릭

### 2.2 Webhook 설정값 입력

| 항목 | 값 |
|------|-----|
| **Name** | `consent-submission-notification` |
| **Table** | `consents` |
| **Events** | ✅ Insert (체크) |
| **Type** | HTTP Request |
| **Method** | POST |
| **URL** | `https://clljgqrbqwexqhketdcu.supabase.co/functions/v1/send-consent-notification` |
| **HTTP Headers** | 아래 참고 👇 |

**HTTP Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbGpncXJicXdleHFoa2V0ZGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjkwMTMsImV4cCI6MjA3OTEwNTAxM30.v6HHE5zjX38LrqzBkpHHTfs_qB1cFwnmJ-JRHxJCU8I
Content-Type: application/json
```

### 2.3 Webhook 저장
- **Create webhook** 또는 **Save** 버튼 클릭

---

## 3단계: 테스트

### 3.1 테스트 동의서 제출
https://ksleep-consent-form.vercel.app 접속해서 테스트 동의서 제출

### 3.2 이메일 확인
1-2분 내에 `sylvie.kim@ksleep.care`로 이메일 도착

**이메일 제목:**
```
🔔 새로운 동의서 제출 - [환자명]
```

**이메일 내용:**
- 환자명
- 생년
- 제출 ID
- 제출일시 (한국 시간)
- 카카오톡 수신 동의 여부
- 관리자 대시보드 바로가기 버튼

---

## 트러블슈팅

### 이메일이 오지 않는 경우

**1. Edge Function 로그 확인**
- Supabase Dashboard > Edge Functions > `send-consent-notification` 클릭
- **Logs** 탭에서 에러 확인

**2. Webhook 실행 여부 확인**
- Supabase Dashboard > Database > Webhooks
- 해당 Webhook 클릭 후 **Recent deliveries** 확인
- 실패한 경우 에러 메시지 확인

**3. Resend API 키 확인**
- https://resend.com/api-keys 에서 API 키 상태 확인
- 월 사용량 제한(3,000통) 초과 여부 확인

**4. 스팸함 확인**
- `sylvie.kim@ksleep.care` 메일함의 스팸/정크 폴더 확인

### 이메일 주소 변경하는 방법

Edge Function 코드의 5번째 줄 수정:
```typescript
const NOTIFICATION_EMAIL = '새로운이메일@example.com'
```

변경 후 다시 **Deploy function** 클릭

---

## 참고사항

- **무료 한도**: Resend는 월 3,000통까지 무료
- **발신 주소**: `K-Sleep Care <onboarding@resend.dev>`
- **응답 시간**: 일반적으로 제출 후 10-30초 내 도착
- **재시도**: Webhook 실패 시 Supabase가 자동으로 3번 재시도

---

## 문의

설정 중 문제가 발생하면:
- Supabase Dashboard의 Logs 확인
- Resend Dashboard (https://resend.com/emails) 에서 발송 이력 확인
