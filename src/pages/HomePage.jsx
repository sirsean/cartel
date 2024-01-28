import { useState, useEffect } from "react";

function DemoCarousel() {
    const images = [
        '/demo/hero-1.png',
        '/demo/hero-2.png',
        '/demo/hero-3.png',
        '/demo/hero-4.png',
        '/demo/hero-5.png',
    ]
    const [selectedImages, setSelectedImages] = useState([]);
    const shuffleImages = () => {
        setSelectedImages([...images].sort(() => 0.5 - Math.random()).slice(0, 4));
    }
    useEffect(() => {
        shuffleImages();
        const interval = setInterval(() => {
            shuffleImages();
        }, 5000);
        return () => clearInterval(interval);
    }, [])
    return (
        <div className="DemoCarousel">
            {selectedImages.map((image, index) => (
                <img key={index} src={image} />
            ))}
        </div>
    );
}

export default function HomePage() {
    return (
        <div>
            <p>Are you sick of buying NFTs that are just a dumb picture that never gets all that popular, and its value never gets back up to the mint price? Do you regret spending that ETH and wish you could get it back?</p>
            <p>The Cartel NFT aims to solve that problem. It's still a dumb picture ... an AI-generated butterfly. You can use it as your PFP if you like it and want to support the project and the larger Redacted Cartel ecosystem. (Redacted uses a butterfly, so we do too.)</p>
            <DemoCarousel />
            <p><strong>But there's a twist.</strong> Whatever ETH you spend to mint the Cartel NFT is deposited into Pirex ETH and held by the contract as apxETH. Each NFT is backed by an equal amount of staked ETH. If you don't like your butterfly picture and want your ETH back, you can either sell it on an NFT marketplace (maybe somebody else does like your butterfly picture for some reason? ... or an opportunity to buy, if for some reason someone is selling one for less than its inherent underlying value) or you can burn the NFT and receive its share of the underlying apxETH.</p>
            <p>The mint cost is based on the current ETH value of the existing NFTs. You are not allowed to reduce the value of everyone else's, so the cost of minting is set such that your new one is worth the same as all the existing ones. There is a small "fee" that pushes your cost slightly above the fair share, so that each Cartel NFT that is minted drives up the shared value of all the others.</p>
            <p>The burn payout similarly has a small "fee" that leaves a little bit of ETH in the pot for everyone else to share. The longer you keep your NFT, not only do you get more staking rewards (via the apxETH), but you also get a larger share as others decide to exit before you.</p>
            <p>Once minted, the NFT doesn't have a picture yet. You must go through the "reveal" process to tell the AI to generate a picture for your NFT. This is a one-time process for each NFT, and once its picture is generated it will stay that way. If you want a new picture, you'll need a new NFT. The apxETH yield still accrues even if you do not reveal, this is not required.</p>
            <p>There is no cap on the supply of these. If at any time, you want to have <strong>exposure to the best ETH staking yield</strong> and simultaneously these AI-generated butterfly pictures, you can mint some of them.</p>
        </div>
    );
}