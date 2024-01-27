// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface PirexEth {
    function deposit(
        address receiver,
        bool shouldCompound
    )
        external
        payable
        returns (uint256 postFeeAmount, uint256 feeAmount);

    function pxEth() external view returns (address);
    function autoPxEth() external view returns (address);
}

contract Cartel is ERC721Enumerable, Ownable, Pausable, ReentrancyGuard {
    uint256 private constant DENOMINATOR = 10000;
    uint256 private _tokenIdCounter = 0;

    PirexEth public pirexEth;
    uint256 public minCost;
    uint256 public depositFeeBps;
    uint256 public withdrawFeeBps;

    constructor(address _pirexEthAddress, uint256 _minCost, uint256 _depositFeeBps, uint256 _withdrawFeeBps)
        ERC721("Cartel", "CARTEL")
        Ownable(msg.sender)
    {
        pirexEth = PirexEth(_pirexEthAddress);
        minCost = _minCost;
        depositFeeBps = _depositFeeBps;
        withdrawFeeBps = _withdrawFeeBps;
    }

    function pxEth() public view returns (IERC20) {
        return IERC20(pirexEth.pxEth());
    }

    function apxEth() public view returns (IERC4626) {
        return IERC4626(pirexEth.autoPxEth());
    }

    function setMinCost (uint256 _minCost) public onlyOwner {
        minCost = _minCost;
    }

    function setDepositFeeBps (uint256 _feeBps) public onlyOwner {
        depositFeeBps = _feeBps;
    }

    function setWithdrawFeeBps (uint256 _feeBps) public onlyOwner {
        withdrawFeeBps = _feeBps;
    }

    function apxEthBalance() public view returns (uint256) {
        return apxEth().balanceOf(address(this));
    }

    /**
     * Returns how much each token is entitled to, of the contract's total
     * underlying apxETH, assuming a fair share with no fees.
     * 
     * If there are no tokens in the contract, returns 0. If there is only
     * 1 token, returns all the apxETH.
     */
    function fairApxEthShare() public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return 0;
        }
        return apxEthBalance() / supply;
    }

    /**
     * Returns how much pxETH each token is entitled to, of the contract's
     * total underlying apxETH, assuming a fair share with no fees.
     */
    function fairPxEthShare() public view returns (uint256) {
        return apxEth().convertToAssets(fairApxEthShare());
    }

    /**
     * How much apxETH each token would currently be able to withdraw, taking
     * into account the withdrawal fee.
     */
    function withdrawApxEthAmount() public view returns (uint256) {
        uint256 share = fairApxEthShare();
        return share - share * withdrawFeeBps / DENOMINATOR;
    }

    /**
     * How much pxETH each token would currently be able to withdraw, taking
     * into account the withdrawal fee.
     */
    function withdrawPxEthAmount() public view returns (uint256) {
        return apxEth().convertToAssets(withdrawApxEthAmount());
    }

    /**
     * Returns the cost of minting a new token, in ETH. The cost is determined
     * by taking the current share of apxETH, converting that to pxETH (assuming
     * that the pxETH/ETH peg is 1:1), and adding the deposit fee.
     */
    function mintCost() public view returns (uint256) {
        uint256 share = fairPxEthShare();
        uint256 cost = share + share * depositFeeBps / DENOMINATOR;
        if (cost < minCost) {
            return minCost;
        } else {
            return cost;
        }
    }

    /**
     * Mint a new token.
     * 
     * The caller must have ETH to cover the mint cost. The ETH is deposited
     * into apxETH and held by the contract.
     */
    function mint() public payable nonReentrant whenNotPaused {
        require(msg.value >= mintCost(), "insufficient ETH to mint");

        // deposit the ETH into Pirex
        if (msg.value > 0) {
            pirexEth.deposit{value: msg.value}(address(this), true);
        }

        // increment the token ID
        _tokenIdCounter++;

        // mint a new token for the sender
        _safeMint(msg.sender, _tokenIdCounter);
    }

    /**
     * Burn an existing token. Only the token's owner is allowed to do this.
     * 
     * The token owner receives their share of apxETH, with the withdrawal fee
     * deducted.
     * 
     * @param tokenId the ID of the token to burn
     */
    function burn(uint256 tokenId) public nonReentrant whenNotPaused {
        // only the token's owner can burn the token
        address owner = ownerOf(tokenId);
        require(owner == msg.sender, "only owner can burn token");

        // get the apxETH the token is entitled to
        uint256 apxEthAmount = withdrawApxEthAmount();

        // send the apxETH tokens to the owner
        if (apxEthAmount > 0) {
            require(apxEth().transfer(owner, apxEthAmount), "apxETH transfer failed");
        }
        
        // burn the token
        _burn(tokenId);
    }

    /**
     * Sweep ETH into Pirex. Any ETH held by this contract, for any reason,
     * will be deposited into Pirex and held by the contract as apxEth.
     */
    function sweepEth() public nonReentrant whenNotPaused {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            pirexEth.deposit{value: balance}(address(this), true);
        }
    }

    function tokenURI(uint256 tokenId) override public view virtual returns (string memory) {
        _requireOwned(tokenId);
        return string(
            abi.encodePacked(
                "https://cartel.sirsean.me/metadata/",
                Strings.toString(tokenId),
                ".json"
            )
        );
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    receive() external payable {
        // this method must exist, even if it does nothing
    }
}