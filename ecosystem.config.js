module.exports = {
  apps: [
    {
      name: "ktltc",
      script: "server.js",
      cwd: "/home/ktltc/ktltc/.next/standalone",
      instances: 4,
      exec_mode: "cluster",
      max_memory_restart: "2.5G",
      node_args: "--dns-result-order=ipv4first --max-old-space-size=2560",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "db_worker",
      script: "./node_modules/.bin/ts-node",
      args: "src/workers/dbWorker.ts",
      cwd: "/home/ktltc/ktltc",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "1G"
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