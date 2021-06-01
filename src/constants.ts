import {BtDeviceInfoMap, BtDeviceType} from "./types";
const pkg = require('../package.json');

const version = `${pkg.name}@${pkg.version}`;

const deviceModels: BtDeviceInfoMap = {
  [BtDeviceType.redmond_socket]: {
    model: 'SkyPlug RSP-100S',
    manufacturer: 'Redmond',
  },
  [BtDeviceType.redmond_kettle]: {
    model: 'SkyKettle RK-200G',
    manufacturer: 'Redmond',
  },
}

export {
  version,
  deviceModels,
}
