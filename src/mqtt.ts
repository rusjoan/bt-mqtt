import {config} from "./config";
import {MqttClient} from "mqtt";
import {Packet} from "mqtt-packet";
import {ISubscriptionGrant} from "mqtt/types/lib/client";
import EventEmitter from "events";
const stringify = require('json-stable-stringify-without-jsonify');

const MqttProvider = require('mqtt');

class Mqtt extends EventEmitter {
  private static instance: Mqtt;
  public client!: MqttClient;

  static async Instance() {
    if (!this.instance) {
      this.instance = new Mqtt();
      await this.instance.connect(config().mqtt_connection);
    }
    return this.instance;
  }

  async connect(connectionString: string) {
    this.client = MqttProvider.connect(connectionString);
    this.client.on('message', (topic: string, payload: Buffer, packet: Packet) => {
      console.debug(`mqtt <`, topic, payload.toString());
      this.emit('message', {
        topic,
        payload: payload.toString(),
      })
    });
  }

  async publish(topic: string, message: any, raw: boolean = false): Promise<number> {
    return new Promise((resolve, reject) => {
      const payload = raw ? message : stringify(message);
      console.debug(`mqtt >`, topic, payload);
      this.client.publish(topic, payload, {retain: true, qos: 0}, (error?: Error, packet?: Packet) => {
        if (error) {
          return reject(error);
        }
        return resolve(packet?.messageId!);
      });
    });
  }

  async subscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, (err: Error, granted: ISubscriptionGrant[]) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}

export {
  Mqtt,
}
