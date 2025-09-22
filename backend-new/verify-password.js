const bcrypt = require('bcryptjs');

async function verifyPassword() {
  const password = 'admin123';
  const hash = '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4rGHv7rIbx4s9usV6Wi';
  
  try {
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('Do they match?', isMatch);
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyPassword();