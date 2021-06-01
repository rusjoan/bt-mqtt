enum BtDeviceType {
  'redmond_socket' = 'redmond_socket',
  'redmond_kettle' = 'redmond_kettle',
}

const DeviceTypeNameMap = {
  [BtDeviceType.redmond_socket]: 'SkyPlug RSP-100S',
  [BtDeviceType.redmond_kettle]: 'SkyKettle RK-G200S',
}

type BtDeviceInfoMap = Record<BtDeviceType, BtDeviceModel>

interface ServiceConf {
  mqtt_connection: string,
  devices: Record<string, BtDeviceConf>,
}

interface BtDeviceConf {
  pretty_name: string,
  mac: string,
  type: BtDeviceType,
}

interface BtDeviceModel {
  model: string,
  manufacturer: string,
}

export {
  ServiceConf,
  BtDeviceConf,
  BtDeviceType,
  BtDeviceInfoMap,
  BtDeviceModel,
  DeviceTypeNameMap,
}
