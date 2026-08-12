module.exports = {
  apps: [
    {
      name: 'whatsapp-connector',
      script: './services/whatsapp-connector-api.js',
      cwd: '/var/www/customerai',
      env: {
        NODE_ENV: 'production',
        PORT: 8083,
        WHATSAPP_BACKEND: 'http://localhost:8080',
        EVOLUTION_API_URL: 'http://localhost:8080',
        EVOLUTION_API_KEY: 'CustomerAI_Secure2026_Evolution',
        INSTANCE_NAME: 'customerai'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      error_file: '/home/ubuntu/logs/whatsapp-connector-error.log',
      out_file: '/home/ubuntu/logs/whatsapp-connector-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    }
  ]
};
