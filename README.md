# RTD count bills

Little script to invoke webservice to count bills over a period of time

## Requirements

Tested with nodev6.6.0 and yarn, but it should work ok with npm
* If no `yarn` available, just replace all commands with `npm`

## Instructions

Clone this repo
```sh
git clone https://github.com/beturs/bills.git
```

Install dependencies
```sh
yarn install
```

Run script
```sh
yarn start
```
It asks for a couple of dates, and returns a kind of JSON response so it could be implemented as a webservice with little adjustments

Test script
```sh
yarn test
```

Report coverage
```
yarn cover
```
