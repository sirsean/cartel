import { mainnet } from 'viem/chains'

// make sure we're pointed at the right address
export const CARTEL_ADDRESS = '0x576455eED627532005fBFF85a98201B51f51efBd';

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

const chains = __APP_ENV__ == 'local' ? [hardhat] : [mainnet];
export { chains };

export const projectId = '8219bb6db3e5c0e72db14e0e9bc40890'