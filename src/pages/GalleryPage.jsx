import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useContractRead } from 'wagmi';
import { formatUnits } from 'viem';
import { workerUrl, workerFetch } from '../api'
import { CARTEL_ADDRESS } from '../address'
import CARTEL_ABI from '../assets/Cartel.json'

function TokenThumbnail({ address, index }) {
    const [tokenId, setTokenId] = useState(null);
    const [metadata, setMetadata] = useState(null);
    useContractRead({
        address: CARTEL_ADDRESS,
        abi: CARTEL_ABI,
        functionName: 'tokenOfOwnerByIndex',
        args: [address, index],
        onSuccess: setTokenId,
        onError: console.error,
    }, [address, index])
    useEffect(() => {
        if (tokenId != null) {
            workerFetch(`/metadata/${tokenId}.json`)
                .then(res => res.json())
                .then(setMetadata)
        }
    }, [tokenId])
    if (metadata != null) {
        return (
            <div className="TokenThumbnail">
                <img src={workerUrl(metadata.image)} />
                <div className="overlay-top-left">
                    #{tokenId.toString()}
                </div>
            </div>
        )
    }
}

function DataFetcher({ address, setBalanceOf }) {
    useContractRead({
        address: CARTEL_ADDRESS,
        abi: CARTEL_ABI,
        functionName: 'balanceOf',
        args: [address],
        onSuccess: setBalanceOf,
        onError: console.error,
    }, [address])
    return null;
}

export default function GalleryPage() {
    const { address } = useAccount();
    const [balanceOf, setBalanceOf] = useState(null);
    const tokenIndexes = Array.from({ length: Number(balanceOf) }, (_, i) => i);
    return (
        <>
            <DataFetcher
                address={address}
                setBalanceOf={setBalanceOf}
                />
            <div className="GalleryPage">
                <h1>Gallery</h1>
                {balanceOf == 0n &&
                    <div>
                        <p>You have no tokens. <Link to="/mint">Mint some!</Link></p>
                        <p>Once you own some Cartel NFTs, they will appear here for your viewing pleasure. This is also where you'll go to reveal their artwork or, if you've had enough, to burn them to extract their underlying value.</p>
                    </div>}
                <div className="gallery">
                    {tokenIndexes.map((tokenIndex) => (
                        <TokenThumbnail
                            key={tokenIndex}
                            address={address}
                            index={tokenIndex}
                            />
                    ))}
                </div>
            </div>
        </>
    )
}