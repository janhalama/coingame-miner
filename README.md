# CoinGame miner
CoinGame-miner is implementation of [TeskaLabs CoinGame](https://github.com/TeskaLabs/coingame) client using  Node.JS and TypeScript technology stack.

## Requirements

* Node.JS version v14.7.0 or higher installed (node -v)
* Git installed
* Yarn installed

## Run miner

Following sequence of commands will clone source code, install dependencies and run miner named *John*.

``` bash
git clone git@github.com:janhalama/coingame-miner.git
cd coingame-miner
yarn install
yarn start:dev John
```

## Configure CoinGame server urls

By default is miner configured to run agains CoinGame server instancedoc on the same box.

You can configure CoinGame miner to different REST API url and AMQP queue endpoint in ./src/index.ts file.

``` ts
const config: Config = {
  apiUrl: 'http://localhost/api',
  ampqConsumerConfig: {
    amqpUrl: 'amqp://coingameminer:guest@localhost:5672',
    ...
  },
  ...
};
```

## Tests

To run tests use following command

``` bash
yarn test
```

