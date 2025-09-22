// Script to check DNS resolution
const dns = require('dns');

console.log('Checking DNS resolution for techzontech.com...');

// Force IPv4
dns.setDefaultResultOrder('ipv4first');

dns.lookup('techzontech.com', { family: 4 }, (err, address, family) => {
  if (err) {
    console.error('❌ IPv4 DNS lookup failed:', err);
  } else {
    console.log('✅ IPv4 DNS lookup successful:');
    console.log('  Address:', address);
    console.log('  Family:', family);
  }
});

dns.lookup('techzontech.com', { family: 6 }, (err, address, family) => {
  if (err) {
    console.error('❌ IPv6 DNS lookup failed:', err);
  } else {
    console.log('✅ IPv6 DNS lookup successful:');
    console.log('  Address:', address);
    console.log('  Family:', family);
  }
});

dns.lookup('techzontech.com', (err, address, family) => {
  if (err) {
    console.error('❌ Default DNS lookup failed:', err);
  } else {
    console.log('✅ Default DNS lookup successful:');
    console.log('  Address:', address);
    console.log('  Family:', family);
  }
});