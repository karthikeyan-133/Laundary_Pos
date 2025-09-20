const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Tally POS System in development mode...\n');

// Function to execute a command
function runCommand(command, cwd, name) {
  console.log(`Starting ${name}...`);
  const child = spawn(command, {
    cwd,
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (error) => {
    console.error(`Failed to start ${name}:`, error);
  });

  child.on('close', (code) => {
    console.log(`${name} exited with code ${code}`);
  });

  return child;
}

// Start both frontend and backend
const backend = runCommand('npm run dev', path.join(__dirname, 'backend-new'), 'Backend Server');
const frontend = runCommand('npm run dev', path.join(__dirname, 'frontend'), 'Frontend Server');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});