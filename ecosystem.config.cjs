module.exports = {
  apps: [
    {
      name: 'customerai-worker',
      script: 'npx',
      args: 'tsx scripts/worker.ts',
      cwd: '/home/ubuntu/projects/customerai',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://customerai:CustomerAI_Secure2026!@localhost:5432/customerai',
        CAMPAIGN_POLL_INTERVAL_MS: '5000',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      exp_backoff_restart_delay: 100,
      error_file: '/home/ubuntu/logs/customerai-worker-error.log',
      out_file: '/home/ubuntu/logs/customerai-worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
