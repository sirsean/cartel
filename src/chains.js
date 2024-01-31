import { mainnet } from 'viem/chains'

// for local development only
const hardhat = {
  id: 31337,
  name: 'Hardhat',
  network: 'hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545'] },
    default: { http: ['http://127.0.0.1:8545/'] },
  },
}

// make sure this is always the way you want it when you commit!
// this connects to hardhat in dev mode
const chains = __APP_ENV__ == 'local' ? [hardhat] : [mainnet];
// this connects to mainnet, even in dev mode (in case you are developing without a local chain)
//const chains = [mainnet];
export { chains };

export const projectId = '8219bb6db3e5c0e72db14e0e9bc40890'