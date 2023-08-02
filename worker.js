import zmq from "zeromq";
import { processTask } from "./process-task.js";

const sinkPort = process.env.SINK_PORT || 5018;
const ventilatorPort = process.env.PRODUCER_PORT || 5016;

async function main() {
  const fromVentilator = new zmq.Pull();
  const toSink = new zmq.Push();

  fromVentilator.connect(`tcp://127.0.0.1:${ventilatorPort}`);
  toSink.connect(`tcp://127.0.0.1:${sinkPort}`);

  function disconnect() {
    fromVentilator.disconnect(`tcp://127.0.0.1:${ventilatorPort}`);
    toSink.disconnect(`tcp://127.0.0.1:${sinkPort}`);
  }

  for await (const message of fromVentilator) {
    if (
      fromVentilator.receiveTimeout === 0 ||
      fromVentilator.receiveTimeout === -1 ||
      !fromVentilator.receiveTimeout
    ) {
      fromVentilator.receiveTimeout = 2500;
    }
    
    const data = JSON.parse(message.toString());
    const found = processTask(data);
    if (found) {
      console.log(`Found! => ${found}`);
      return toSink.send(`Found: ${found}`).then(() => {
        disconnect();
      });
    }
  }
}

main().catch((err) => console.log(err));
