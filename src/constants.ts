import {BtDeviceInfoMap, BtDeviceType} from "./types";

const version = 'bt-mqtt 0.0.1';

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
