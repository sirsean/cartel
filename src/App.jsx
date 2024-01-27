import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MintPage from './pages/MintPage';
import ViewNFTPage from './pages/ViewNFTPage';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig, useAccount, useBalance, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import { mainnet } from 'viem/chains'
import { CARTEL_ADDRESS } from './address'
import CARTEL_ABI from './assets/Cartel.json'
import './App.css'

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

// make sure we're connected to the right chain
const chains = [hardhat]
//const chains = [mainnet]
const projectId = '8219bb6db3e5c0e72db14e0e9bc40890'

const wagmiConfig = defaultWagmiConfig({ chains, projectId })

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'dark',
})

function Header() {
  return (
    <header>
      <div>
        <h1><Link to="/">Cartel</Link></h1>
      </div>
      <div className="header-right">
        <h2><Link to="/mint">Mint</Link></h2>
        <w3m-button />
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer>
      <ul>
        <li><a target="_blank" href="https://github.com/sirsean/cartel">Github</a></li>
        <li><a target="_blank" href="#">Etherscan</a></li>
        <li><a target="_blank" href="#">Opensea</a></li>
      </ul>
    </footer>
  )
}

function App() {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <Router>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/mint" element={<MintPage />} />
              <Route path="/nft/:id" element={<ViewNFTPage />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </WagmiConfig>
    </>
  )
}

export default App
