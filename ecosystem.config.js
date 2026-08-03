module.exports = {
  apps: [
    {
      name: "ktltc",
      script: ".next/standalone/server.js",
      cwd: "/home/ktltc/ktltc",
      instances: 4,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "system_health_check",
      script: "./scripts/system_health_check.js",
      instances: 1,
      exec_mode: "fork",
      cron_restart: "0 * * * *",
      watch: false,
      autorestart: false
    },
    {
      name: "auto_update",
      script: "./scripts/auto_update.js",
      instances: 1,
      exec_mode: "fork",
      cron_restart: "0 3 * * *",
      watch: false,
      autorestart: false
    }
  ]
};