module.exports = {
  apps: [
    {
      name: 'api',
      script: './server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5002
      }
    }
  ]
};
