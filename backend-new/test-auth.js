const bcrypt = require('bcryptjs');

// Test password hashing
async function testPasswordHashing() {
  const password = 'admin123';
  const saltRounds = 10;
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
    
    // Verify the password
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('Password match:', isMatch);
    
    // Test with wrong password
    const isWrongMatch = await bcrypt.compare('wrongpassword', hashedPassword);
    console.log('Wrong password match:', isWrongMatch);
  } catch (error) {
    console.error('Error:', error);
  }
}

testPasswordHashing();