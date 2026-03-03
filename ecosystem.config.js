module.exports = {
  apps: [
    {
      name: "asert-frontend",
      script: "node_modules/http-server/bin/http-server",
      args: "dist/stand-alone/browser",
      env: {
        PORT: 8082,
      },
    },
  ],
};
