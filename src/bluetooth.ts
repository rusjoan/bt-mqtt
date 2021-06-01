import {execSync} from "child_process";
import {Mutex} from 'async-mutex';

let mutex = new Mutex();

async function redmondSocket(mac: string, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    mutex.acquire().then(release => {
      try {
        console.debug('redmondSocket >', mac, command);
        const result = execSync(`/home/pi/redmond/rsp100s.sh ${mac} ${command}`);
        console.debug('redmondSocket <', result.toString());
        resolve(result.toString());
      } catch (e) {
        reject(e);
      } finally {
        release();
      }
    });
  });
}

export {
  redmondSocket,
}
