ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(100);
ALTER TABLE users ADD COLUMN reset_password_expires TIMESTAMP;
