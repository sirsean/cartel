import { useState } from 'react'
import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import { formatUnits, parseUnits } from 'viem';
import { CARTEL_ADDRESS } from '../address'
import CARTEL_ABI from '../assets/Cartel.json'

function DataFetcher({ setApxEthBalance, setFairPxEthShare, setTotalSupply, setMintCost, setDepositFeeBps, setWithdrawFeeBps }) {
  useContractRead({
    address: CARTEL_ADDRESS,
    abi: CARTEL_ABI,
    functionName: 'apxEthBalance',
    args: [],
    watch: true,
    onSuccess: setApxEthBalance,
  })
  useContractRead({
    address: CARTEL_ADDRESS,
    abi: CARTEL_ABI,
    functionName: 'fairPxEthShare',
    args: [],
    watch: true,
    onSuccess: setFairPxEthShare,
  })
  useContractRead({
    address: CARTEL_ADDRESS,
    abi: CARTEL_ABI,
    functionName: 'totalSupply',
    args: [],
    watch: true,
    onSuccess: setTotalSupply,
  })
  useContractRead({
    address: CARTEL_ADDRESS,
    abi: CARTEL_ABI,
    functionName: 'mintCost',
    args: [],
    watch: true,
    onSuccess: (mintCost) => {
        // the amount of ETH in apxETH increases every block, so let's
        // add a tiny fudge factor here so the call doesn't fail for
        // insufficient ETH
        setMintCost(mintCost + parseUnits('0.000001', 18))
    },
  })
  useContractRead({
    address: CARTEL_ADDRESS,
    abi: CARTEL_ABI,
    functionName: 'depositFeeBps',
    args: [],
    watch: true,
    onSuccess: setDepositFeeBps,
  })
  useContractRead({
    address: CARTEL_ADDRESS,
    abi: CARTEL_ABI,
    functionName: 'withdrawFeeBps',
    args: [],
    watch: true,
    onSuccess: setWithdrawFeeBps,
  })
  return null;
}

function MintButton({ mintCost }) {
    const { data: tx, isLoading: isSigning, write: mint } = useContractWrite({
        address: CARTEL_ADDRESS,
        abi: CARTEL_ABI,
        functionName: 'mint',
        value: mintCost,
    })
    const { data: receipt, isLoading: isConfirming } = useWaitForTransaction({
        hash: tx?.hash,
        confirmations: 1,
    })
    const onClick = (e) => {
        e.preventDefault();
        if (mint) {
            mint();
        }
    }
    return (
        <div className="MintButton">
            {mintCost != null &&
                <p>The current mint cost is {formatUnits(mintCost, 18)} ETH.</p>}
            {isSigning && <p>Signing...</p>}
            {isConfirming && <p>Confirming...</p>}
            {!isSigning && !isConfirming && mintCost != null &&
                <button onClick={onClick}>Mint</button>}
            {receipt &&
                <p>
                    <a target="_blank" href={`https://etherscan.io/tx/${receipt.transactionHash}`}>View on Etherscan</a>
                </p>}
        </div>
    );
}

export default function MintPage() {
    const [apxEthBalance, setApxEthBalance] = useState(null);
    const [fairPxEthShare, setFairPxEthShare] = useState(null);
    const [totalSupply, setTotalSupply] = useState(null);
    const [mintCost, setMintCost] = useState(null);
    const [depositFeeBps, setDepositFeeBps] = useState(null);
    const [withdrawFeeBps, setWithdrawFeeBps] = useState(null);
    return (
        <>
            <DataFetcher
                setApxEthBalance={setApxEthBalance}
                setFairPxEthShare={setFairPxEthShare}
                setTotalSupply={setTotalSupply}
                setMintCost={setMintCost}
                setDepositFeeBps={setDepositFeeBps}
                setWithdrawFeeBps={setWithdrawFeeBps}
                />
            <div>
                <h1>Mint</h1>
                <p>When you mint a Cartel NFT, it costs the current underlying value of the rest of the NFTs; each of them has an equal share of the staked apxETH that everyone else spent to mint, and this increases over time due to the staking yield.</p>
                {apxEthBalance != null && fairPxEthShare != null && totalSupply != null &&
                    <p>The current total supply is {formatUnits(totalSupply, 0)} NFT{totalSupply == 1n ? '' : 's'}, sharing a total of {formatUnits(apxEthBalance, 18)} apxETH between them, worth {formatUnits(fairPxEthShare, 18)} pxETH each.</p>}
                {depositFeeBps != null && withdrawFeeBps != null &&
                    <p>When you mint, you have to deposit {formatUnits(depositFeeBps, 2)}% more than the fair share, thus increasing the overall value of the pool. Likewise, when you withdraw, you will leave {formatUnits(withdrawFeeBps, 2)}% of your underlying value in the pool for everyone else to share.</p>}
                <MintButton mintCost={mintCost} />
            </div>
        </>
    );
}