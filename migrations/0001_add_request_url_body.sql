-- Add requestUrl and requestBody columns to request_logs table
ALTER TABLE "request_logs" ADD COLUMN IF NOT EXISTS "request_url" text;
ALTER TABLE "request_logs" ADD COLUMN IF NOT EXISTS "request_body" jsonb;
