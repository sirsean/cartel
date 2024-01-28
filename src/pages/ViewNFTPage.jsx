import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import { formatUnits } from 'viem';
import { workerUrl, workerFetch } from '../api'
import { CARTEL_ADDRESS } from '../address'
import CARTEL_ABI from '../assets/Cartel.json'

function Reveal({ tokenId, metadata }) {
    const [isRevealing, setIsRevealing] = useState(false);
    const [revealTick, setRevealTick] = useState(0);
    if (!metadata) {
        return null;
    }
    const revealPhrases = [
        'Randomizing butterfly...',
        'Generating AI image...',
        'AI is thinking...',
        'This can take a little while...',
        'Almost there...',
    ];
    const onClickReveal = (e) => {
        e.preventDefault();
        setIsRevealing(true);
        setInterval(() => setRevealTick(revealTick => (revealTick + 1) % revealPhrases.length), 3000);
        workerFetch(`/api/reveal?id=${tokenId}`, { method: 'POST' })
            .then(() => window.location.reload())
    }
    const isUnrevealed = metadata?.attributes?.find(attr => attr?.trait_type === 'unrevealed' && attr?.value === 'true')
    if (!isUnrevealed) {
        return null;
    }
    return (
        <div className="MintButton">
            {!isRevealing &&
                <button onClick={onClickReveal}>Reveal</button>}
            {isRevealing &&
                <div>
                    <p>{revealPhrases[revealTick]}</p>
                </div>}
        </div>
    );
}

function Burn({ tokenId }) {
    const navigate = useNavigate();
    const [withdrawApxEthAmount, setWithdrawApxEthAmount] = useState(null);
    useContractRead({
        address: CARTEL_ADDRESS,
        abi: CARTEL_ABI,
        functionName: 'withdrawApxEthAmount',
        args: [],
        watch: true,
        onSuccess: setWithdrawApxEthAmount,
    })
    const { data: tx, isLoading: isSigning, write: burn } = useContractWrite({
        address: CARTEL_ADDRESS,
        abi: CARTEL_ABI,
        functionName: 'burn',
        args: [tokenId],
    })
    const { data: receipt, isLoading: isConfirming } = useWaitForTransaction({
        hash: tx?.hash,
        confirmations: 1,
        onSuccess: () => navigate('/gallery'),
    })
    const onClick = (e) => {
        e.preventDefault();
        if (burn) {
            burn();
        }
    }
    return (
        <div className="MintButton">
            {withdrawApxEthAmount != null &&
                <p>Burn this NFT to receive {formatUnits(withdrawApxEthAmount, 18)} apxETH.</p>}
            {isSigning && <p>Signing...</p>}
            {isConfirming && <p>Confirming...</p>}
            {!isSigning && !isConfirming && withdrawApxEthAmount != null &&
                <button onClick={onClick}>Burn</button>}
            {receipt &&
                <p>
                    <a target="_blank" href={`https://etherscan.io/tx/${receipt.transactionHash}`}>View on Etherscan</a>
                </p>}
        </div>
    );
}

export default function ViewNFTPage() {
    const { id } = useParams();
    const [metadata, setMetadata] = useState(null);
    useEffect(() => {
        if (id) {
            workerFetch(`/metadata/${id}.json`)
                .then(res => res.json())
                .then(setMetadata);
        }
    }, [id])
    if (!metadata) {
        return null;
    }
    return (
        <div className="ViewNFTPage">
            <h1>{metadata?.name}</h1>
            <img src={workerUrl(metadata?.image)} />
            <p className="description">{metadata?.description}</p>
            <Reveal tokenId={id} metadata={metadata} />
            <Burn tokenId={id} />
        </div>
    )
}