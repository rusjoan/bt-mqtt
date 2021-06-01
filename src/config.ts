import {ServiceConf} from "./types";
const yaml = require('js-yaml');
const fs = require('fs');

let cached: ServiceConf;

function config(): ServiceConf {
  if (cached) {
    return cached;
  }
  const filepath = process.env.CONFIG || 'config.yaml';
  const data = fs.readFileSync(filepath);
  const serviceConf = yaml.load(data) as ServiceConf;
  if (!serviceConf.mqtt_connection) {
    serviceConf.mqtt_connection = 'mqtt://localhost';
  }
  console.info(`config loaded from ${filepath}`);
  cached = serviceConf;
  return serviceConf;
}

export {
  config,
}
