-- Create the pos_user if it doesn't exist
CREATE USER IF NOT EXISTS 'pos_user'@'localhost' IDENTIFIED BY 'Welc0me$27';

-- Grant necessary privileges to pos_user
GRANT ALL PRIVILEGES ON Pos_system.* TO 'pos_user'@'localhost';

-- Apply the changes
FLUSH PRIVILEGES;