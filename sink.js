import zmq from "zeromq";

const port = process.env.PORT || 5018;

async function main() {
  const sink = new zmq.Pull();
  await sink.bind(`tcp://*:${port}`);
  for await (const rawMessage of sink) {
    console.log("Message from worker: ", rawMessage.toString());
  }
}


main().catch(err => console.log(err));
