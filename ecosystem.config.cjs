module.exports = {
  apps: [
    {
      name: "trips-frontend",
      script: "serve",
      env: {
        PM2_SERVE_PATH: "/home/vasil/pm2-static/trips_frontend_1",
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html",
      },
    },
  ],
  deploy: {
    production: {
      user: "vasil",
      host: "192.168.10.27",
      ref: "origin/main",
      path: "/home/vasil/pm2/trips/trips-frontend",
      repo: "git@github.com:vsterev/excursion-fe.git",
      "post-deploy": `source ~/.nvm/nvm.sh \
        && yarn install \
        && yarn build --outDir /home/vasil/pm2-static/trips_frontend_1 --mode production --emptyOutDir\
        && pm2 startOrReload ecosystem.config.cjs --only trips-frontend`,
    },
  },
};
