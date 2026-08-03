module.exports = {
  apps: [
    {
      name: "ktltc",
      script: "server.js",
      cwd: "/home/ktltc/ktltc/.next/standalone",
      instances: 4,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};