import { useParams } from "react-router-dom";

export default function ViewNFTPage() {
    const { id } = useParams();
    return (
        <div>
            <h1>View NFT Page { id }</h1>
        </div>
    )
}