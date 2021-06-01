import {config} from "./config";
import {SkySocketDevice} from "./devices";
import {BtDeviceType} from "./types";
import {Mqtt} from "./mqtt";

let devices = Array<SkySocketDevice>();
const serviceNamespace = 'bt-mqtt';

async function init() {
  const devicesToLoad = config().devices;
  for (const id in devicesToLoad) {
    const deviceConf = devicesToLoad[id];
    if (deviceConf.type === BtDeviceType.redmond_socket || deviceConf.type === BtDeviceType.redmond_kettle) {
      const device = new SkySocketDevice(serviceNamespace, id, deviceConf);
      devices.push(device);
      device.runThread();
    }
  }
  if (!devices.length) {
    console.warn('no devices, exiting...');
  } else {
    console.info(`${devices.length} devices initialized`);
  }
}

init();

async function handleQuit() {
  for (const d of devices) {
    await d.stop();
  }
  // await (new Promise(resolve => setTimeout(resolve, 1000)));
  (await Mqtt.Instance()).client.end(false, {}, () => {
    process.exit(0);
  });
}

process.on('SIGINT', handleQuit);
process.on('SIGTERM', handleQuit);
