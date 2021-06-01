import {BtDeviceConf} from "./types";
import {Mqtt} from "./mqtt";
import {deviceModels} from "./constants";
import {redmondSocket} from "./bluetooth";

const hassPrefix = 'homeassistant';
const online = 'online';
const offline = 'offline';
const ON = 'ON';
const SOCKET_IS_ON = 'SOCKET_IS_ON';
const OFF = 'OFF';
const SOCKET_IS_OFF = 'SOCKET_IS_OFF';

/**
 * Only switch supported for now
 **/
class SkySocketDevice {
  protected conf: BtDeviceConf;
  protected readonly command_topic: string;
  protected readonly state_topic: string;
  protected readonly json_attributes_topic: string;
  protected readonly availability_topic: string;
  protected readonly hass_config_topic: string;
  protected readonly unique_id: string;
  protected readonly pretty_name: string;
  protected mqtt!: Mqtt;
  protected handlers = new Map<string, (payload: string) => {}>();

  constructor(serviceNamespace: string, deviceId: string, conf: BtDeviceConf) {
    this.conf = conf;
    this.pretty_name = conf.pretty_name;
    this.unique_id = `bt-${deviceId}`;
    this.command_topic = `${serviceNamespace}/${this.unique_id}/set`;
    this.availability_topic = `${serviceNamespace}/${this.unique_id}/avail`;
    this.state_topic = `${serviceNamespace}/${this.unique_id}`;
    this.json_attributes_topic = `${serviceNamespace}/${this.unique_id}`;
    this.hass_config_topic = `${hassPrefix}/switch/${this.unique_id}/switch/config`;
    console.info(`device ${deviceId} created`);
  }

  private configJson(): any {
    return {
      "payload_off": OFF,
      "payload_on": ON,
      "value_template": "{{ value_json.state }}",
      "command_topic": this.command_topic,
      "state_topic": this.state_topic,
      "json_attributes_topic": this.json_attributes_topic,
      "name": this.pretty_name,
      "unique_id": this.unique_id,
      "device": {
        "identifiers": [this.unique_id],
        "name": `socket_${this.unique_id}`,
        "sw_version": "bt-mqtt 0.0.1",
        "model": deviceModels[this.conf.type].model,
        "manufacturer": deviceModels[this.conf.type].model,
      },
      "availability_topic": this.availability_topic,
    };
  }

  protected async publishConfig() {
    return this.mqtt.publish(this.hass_config_topic, this.configJson());
  }

  protected async publishState(state: string) {
    return this.mqtt.publish(this.state_topic, {
      state,
    });
  }

  protected warn(...args: any[]) {
    console.warn(`device ${this.unique_id}:\t`, ...args)
  }

  private async commandTopicHandler(payload: string) {
    let success = false;
    if (payload === ON || payload === OFF) {
      for (let i = 0; i < 5; i++) {
        // turn on
        const command = payload === ON ? 'on' : 'off';
        const expected = payload === ON ? SOCKET_IS_ON : SOCKET_IS_OFF;
        // @ts-ignore
        const result = await redmondSocket(this.conf.mac, command);
        // check for expected result
        if (result.search(expected) > -1) {
          success = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      // update status
      if (success) {
        await this.publishState(payload);
      }
      return;
    }
    this.warn('unknown command payload', payload);
  }

  private statusCheckLoop() {
    setTimeout(this.statusCheck.bind(this), 60000);
  }

  private async statusCheck() {
    let on, off;
    for (let i = 0; i < 5; i++) {
      // turn on
      // @ts-ignore
      const result = await redmondSocket(this.conf.mac, 'status');
      // check for result
      on = result.search(SOCKET_IS_ON) > -1;
      off = result.search(SOCKET_IS_OFF) > -1;
      if (on || off) {
        break;
      }
    }
    if (on || off) {
      // update status
      await this.setAvailability(true);
      await this.publishState(on ? ON : OFF);
    } else {
      await this.setAvailability(false);
    }
    this.statusCheckLoop();
  }

  private async setAvailability(avail: boolean) {
    return this.mqtt.publish(this.availability_topic, avail ? online : offline, true);
  }

  async runThread() {
    // set up handlers
    this.handlers.set(this.command_topic, this.commandTopicHandler.bind(this));
    // connect to qtt
    this.mqtt = await Mqtt.Instance();
    // publish hass autodiscover config
    await this.publishConfig();
    // subscribe for commands
    await this.mqtt.subscribe(this.command_topic);
    // mqtt messages handling
    this.mqtt.on('message', ({ topic, payload }) => {
      const handler = this.handlers.get(topic);
      if (handler) {
        handler(payload);
      }
    });
    // switch status lookup
    this.statusCheckLoop();
    this.statusCheck();
    //
    console.info(`device ${this.unique_id} thread started`);
  }

  async stop() {
    return this.setAvailability(false);
  }
}

export {
  SkySocketDevice,
  online,
  offline,
  ON,
  OFF,
}
