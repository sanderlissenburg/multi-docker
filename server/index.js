const keys = require('./keys');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

// Express setup
const app = express();
app.use(bodyParser.json());
app.use(cors());

console.log(keys);

// Postgres setup
const pgClient = new Pool({
  user: keys.pgUser,
  password: keys.pgPassword,
  host: keys.pgHost,
  port: keys.pgPort,
  database: keys.pgDatabase,
});

pgClient.on('error', () => console.log('Lost postgres connection'));

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch((err) => console.log(err));

// Redis setup
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');

  res.send(values.rows);
});

app.get('/values/current', (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (index > 40) {
    res.status(422).send('Index to high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);

  pgClient.query('INSERT INTO values (number) VALUES ($1)', [index]);

  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log('Listening on port 5000');
});
