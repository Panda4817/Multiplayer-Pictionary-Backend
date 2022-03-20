const { Kafka } = require('kafkajs');

const test = process.env.TEST;
 
const kafka = new Kafka({
  brokers: [test ? "" : process.env.KAFKA_URL],
  sasl: {
    mechanism: test ? "" : process.env.KAFKA_MECHANISM,
    username: test ? "" : process.env.KAFKA_USERNAME,
    password: test ? "" : process.env.KAFKA_PASSWORD,
  },
  ssl: true,
})

// setup kafka producer
const producer = kafka.producer()

// Send a message about which word is chosen for drawing
const sendWordMessage = async (word) => {
    await producer.connect()
    await producer.send({
        topic: 'logs',
        messages: [
            { key: "word", value: word },
        ],
    }).then(console.log).catch(e => console.error(e.message));
    await producer.disconnect()
    return true;
}
 
module.exports = {
   sendWordMessage
}