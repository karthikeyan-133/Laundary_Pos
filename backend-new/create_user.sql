-- Create database user and grant permissions
-- This script should be run in MySQL Workbench with root privileges

CREATE DATABASE IF NOT EXISTS Pos_system CHARACTER SET UTF8MB4;

CREATE USER IF NOT EXISTS 'pos_user'@'localhost' IDENTIFIED BY 'Welc0me$27';

GRANT ALL PRIVILEGES ON Pos_system.* TO 'pos_user'@'localhost';

FLUSH PRIVILEGES;

-- Verify the user was created
SELECT User, Host FROM mysql.user WHERE User = 'pos_user';