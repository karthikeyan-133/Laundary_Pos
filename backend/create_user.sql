-- Create a new user for the POS system
CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'Welc0me$27';

-- Grant privileges to the new user
GRANT ALL PRIVILEGES ON Pos_system.* TO 'pos_user'@'localhost';

-- Apply the changes
FLUSH PRIVILEGES;