# Cartel NFT Contract

This contract manages the Cartel NFTs.

Cartel NFTs are backed by staked ETH in the form of apxETH. When you mint,
you must provide ETH to the contract such that you have increased the
underlying balance of all existing tokens in the contract. You may burn an
NFT to withdraw its share of apxETH to your wallet, which you can then do
with what you like.

There are small fees involved. The deposit "fee", if non-zero, requires you
to deposit more than your fair share, thus increasing the value of all NFTs
each time a new one is minted. The withdrawal "fee", if non-zero, leaves a
small portion of your NFT's underlying value in the contract to be shared by
everyone who did not burn. These fees should be small, and the value should be
dominated by the apxETH staking yield.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/deploy.js
```

## Verification

```shell
npx hardhat --network mainnet verify --constructor-args scripts/args.js <address>
```

## Local Development

Once you've started a node,

```shell
npx hardhat node
```

You can deploy:

```shell
npx hardhat run scripts/deploy.js --network localhost
```

It is often useful to slow down the network so you can work with it in the UI.
To do this, update the `networks` section in `hardhat.config.js` and restart
the node.

```json
{
    "networks": {
        "hardhat": {
            "mining": {
                "auto": false,
                "interval": 10000,
            }
        }
    }
}
```