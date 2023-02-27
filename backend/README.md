
## Available Scripts

In the project directory, you can run:

### `npm ci`

Installs dependencies

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in your browser.

### `push protocol`

For testing purpose, go to https://staging.push.org/#/inbox and connect your wallet.
Go to Channels, search for ETHHackathonSF and then click Opt-In

### `local test`

```
curl -X POST http://localhost:3001/api/fake
```

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"email":"yuzhang@jomo.network"}' \
  http://localhost:3001/api/generate_verification_code
```

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"publicResults":"123", "proof": "321"}' \
  http://localhost:3001/api/validate_proof
```

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"wallet_address":"0x14483A6F963de871FBc693746e2fa54bFFA63700"}' \
  http://localhost:3001/api/get_wallet_nonce
```

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"wallet_address":"0x14483A6F963de871FBc693746e2fa54bFFA63700", "signature": "xxx"}' \
  http://localhost:3001/api/get_wallet_proof_inputs
```
### `lint`
```
./node_modules/.bin/eslint yourfile.js
```