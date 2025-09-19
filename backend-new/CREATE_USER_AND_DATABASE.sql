-- MySQL Script to Create Database and User for Tally POS System
-- Run this script as a MySQL root user or a user with sufficient privileges

-- Create the Pos_system database
CREATE DATABASE IF NOT EXISTS Pos_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user for the Tally POS system
-- Replace 'pos_user' and 'Welc0me$27' with your preferred username and password
CREATE USER IF NOT EXISTS 'pos_user'@'localhost' 
  IDENTIFIED BY 'Welc0me$27';

-- Grant all privileges on the Pos_system database to the pos_user
GRANT ALL PRIVILEGES ON Pos_system.* TO 'pos_user'@'localhost';

-- Apply the changes
FLUSH PRIVILEGES;

-- Optional: Verify the user was created
-- SELECT User, Host FROM mysql.user WHERE User = 'pos_user';

-- Optional: Verify database was created
-- SHOW DATABASES LIKE 'Pos_system';

-- Instructions:
-- 1. Connect to MySQL as root: mysql -u root -p
-- 2. Run this script: source CREATE_USER_AND_DATABASE.sql
-- 3. Update your .env file with:
--    DB_USER=pos_user
--    DB_PASSWORD=Welc0me$27