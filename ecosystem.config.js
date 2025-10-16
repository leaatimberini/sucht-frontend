// /var/www/sucht/frontend/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'sucht-frontend',
    script: 'npm',
    args: 'run start',
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: "--max-old-space-size=4096",
    }
  }],
};
