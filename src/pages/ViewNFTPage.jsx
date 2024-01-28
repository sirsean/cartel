import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { workerUrl, workerFetch } from '../api'
import { CARTEL_ADDRESS } from '../address'
import CARTEL_ABI from '../assets/Cartel.json'

export default function ViewNFTPage() {
    const { id } = useParams();
    const [metadata, setMetadata] = useState(null);
    const [isRevealing, setIsRevealing] = useState(false);
    const [revealTick, setRevealTick] = useState(0);
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
        workerFetch(`/api/reveal?id=${id}`, { method: 'POST' })
            .then(() => window.location.reload())
    }
    const isUnrevealed = metadata?.attributes?.find(attr => attr?.trait_type === 'unrevealed' && attr?.value === 'true')
    return (
        <div className="ViewNFTPage">
            <h1>{metadata?.name}</h1>
            <img src={workerUrl(metadata?.image)} />
            <p className="description">{metadata?.description}</p>
            {isUnrevealed &&
                <div className="MintButton">
                    {!isRevealing && 
                        <button onClick={onClickReveal}>Reveal</button>}
                    {isRevealing &&
                        <div>
                            <p>{revealPhrases[revealTick]}</p>
                        </div>}
                </div>}
        </div>
    )
}