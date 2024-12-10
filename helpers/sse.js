const { randomUUID } = require("node:crypto");

class EventServer {
  constructor() {
    this.subscribers = [];
  }

  add(subscriber) {
    const data = {
      id: randomUUID(),
      writer: subscriber,
    };

    this.subscribers.push(data);

    return {
      id: data.id,
      dispose: () => {
        this.subscribers = this.subscribers.filter((s) => s.id !== data.id);
      },
    };
  }

  publish(data) {
    const encodedData = JSON.stringify(data);

    this.subscribers.forEach((subscriber) => {
      subscriber.writer.write(`data: ${encodedData}\n\n`);
    });
  }
}

module.exports = new EventServer();
