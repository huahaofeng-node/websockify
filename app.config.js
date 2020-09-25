const YAML = require('yaml');
const fs = require('fs');
const { environment } = require('./app.environment');
const { join } = require('path');

const file = fs.readFileSync(join(__dirname, `./env/app.${environment}.yml`), 'utf8');
const env = YAML.parse(file);
console.log(env);

exports.APP = {
  NAME: env.app.name,
  PORT: env.app.port,
  NOVNC_PATH: env.app.novnc_path,
};

exports.VNC = {
  HOST: env.vnc.host,
  PORT: env.vnc.port,
};
