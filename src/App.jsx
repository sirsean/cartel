import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MintPage from './pages/MintPage';
import GalleryPage from './pages/GalleryPage';
import ViewNFTPage from './pages/ViewNFTPage';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { CARTEL_ADDRESS } from './address'
import { chains, projectId } from './chains'
import './App.css'

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
      <div className="header-left">
        <h1><Link to="/">Cartel</Link></h1>
      </div>
      <div className="header-right">
          <w3m-button />
          <div className="navigation">
            <h2><Link to="/mint">Mint</Link></h2>
            <h2><Link to="/gallery">Gallery</Link></h2>
          </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer>
      <ul>
        <li><a target="_blank" href="https://github.com/sirsean/cartel">Github</a></li>
        <li><a target="_blank" href={`https://etherscan.io/address/${CARTEL_ADDRESS}`}>Etherscan</a></li>
        <li><a target="_blank" href="https://opensea.io/collection/cartel-butterfly">Opensea</a></li>
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
              <Route path="/gallery" element={<GalleryPage />} />
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
