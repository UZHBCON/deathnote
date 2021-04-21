# DeathNote

## Getting Started
### Prerequisites:
- Docker and Docker-compose
- [Install MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) extension.
- Open MetaMask and create an account. Note down your passphrase.
- Connect MetaMask to the Ropsten testnet.
- [Transfer some ether](https://faucet.ropsten.be/) to your address.
- Sign up and create a new project with [Infura](https://infura.io/). Under project/settings/keys, in ENDPOINTS select 'ROPSTEN' and copy the url that starts with: https://ropsten.infura.io/v3/...

### Installation
1. Clone this git repo and cd into it
1. Run ```docker-compose up```
2. Run ```docker exec -it blockchain /bin/bash``` (in a new terminal)
3. Run ```truffle develop```
4. Create a ```.env``` file at the root of the project and set values according to yours. 
    ```
    REACT_APP_API_URL=http://127.0.0.1:8545
    ROPSTEN_API=https://ropsten.infura.io/v3/<YOUR_API_KEY>
    MNEMONIC=<YOUR_META_MASK_PASSPHRASE>
    ```

### Local Deployment
#### NOTE: Switch to another browser for local development (where no MetaMask extension is installed)
If you want to deploy your DApp to a local network and test it, you need to disable your MetaMask extension.

1. Run ```truffle develop```
2. Run ```migrate``` This will compile, migrate and deploy your SC to a local testnet
3. Open a browser window at [localhost:3000](http://127.0.0.1:3000)

### Ropsten Deployment
Ropsten is a testnet equivalent to ethererum mainnet.

1. Run ```truffle deploy --network ropsten``` // This will compile and deploy your SC to the ropsten testnet.
2. Open a browser window at [localhost:3000](http://127.0.0.1:3000) (in Chrome)
3. Connect MetaMask to the site.