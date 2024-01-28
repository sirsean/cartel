# Cartel

This is the Cartel NFT dapp.

The basic premise is that this is an uncapped collection of NFTs, backed by
staked ETH (in the form of Redacted's apxETH). The apxETH is evenly shared among
all the NFTs that exist, and the cost to mint is determined by the current ETH
value of the existing underlying apxETH. (Each new NFT must raise the value of
all the others that came before it, by a tiny bit.) The NFTs can be burned, and
their share of the underlying apxETH will be distributed to the owner that burned.

Meanwhile, the image for each NFT is generated by AI (Stable Diffusion), in a separate post-mint step. The reveal is not _necessary_, as the NFT has value from
its underlying apxETH regardless of the image. But you might like it?

## Development

For local development, you will need to set some environment variables using
helper files.

The backend uses `.dev.vars`.

```sh
cp .dev.vars.template .dev.vars
```

The frontend uses `.env`.

```sh
cp .env.template .env
```

Edit these files to suit your needs. Note that `APP_ENV=local` is a good idea for
running locally, as it switches the chain from Ethereum mainnet to Hardhat, and
tells the UI to use its local backend server rather than the actual production URL.

Deploy your local network with:

```sh
cd contract
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

Run the webserver:

```sh
npm run dev
```