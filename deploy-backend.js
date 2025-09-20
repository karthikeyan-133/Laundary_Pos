const { exec } = require('child_process');
const path = require('path');

console.log('Starting backend deployment to Vercel...');

// Change to backend directory and deploy
const backendPath = path.join(__dirname, 'backend-new');
console.log(`Deploying from directory: ${backendPath}`);

exec(`cd "${backendPath}" && vercel --prod --yes`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Deployment failed with error: ${error}`);
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log('Deployment stdout:', stdout);
  console.log('Backend deployment completed successfully!');
});