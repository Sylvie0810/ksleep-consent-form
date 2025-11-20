-- Supabase SQL Editor에서 이 쿼리를 실행하세요
-- https://supabase.com/dashboard/project/clljgqrbqwexqhketdcu/editor

CREATE TABLE patients (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    birth_year TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    guardian_relation TEXT,
    consent_token TEXT UNIQUE,
    consent_sent_at TIMESTAMPTZ,
    consent_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 설정 (anon key 사용)
CREATE POLICY "Enable read access for all users" ON patients
    FOR SELECT USING (true);

-- 모든 사용자가 삽입/수정할 수 있도록 설정
CREATE POLICY "Enable insert for all users" ON patients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON patients
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON patients
    FOR DELETE USING (true);

-- 인덱스 추가 (성능 향상)
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_consent_token ON patients(consent_token);
CREATE INDEX idx_patients_consent_completed ON patients(consent_completed);
