const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const ERC20_ABI = require("./abi/ERC20.json");

const pirexEthAddress = "0xD664b74274DfEB538d9baC494F3a4760828B02b0";
const minCost = ethers.parseEther("0.1");

describe("Cartel", function () {
    async function deploy() {
        // signers
        const [deployer] = await ethers.getSigners();

        // deploy contract
        const Cartel = await ethers.getContractFactory("Cartel");
        const cartel = await Cartel.deploy(pirexEthAddress, minCost, 0, 0, 1000);

        const apxEth = new ethers.Contract('0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6', ERC20_ABI, ethers.provider);

        return { cartel, apxEth, deployer };
    }

    describe("ownership", () => {
        it("should be owned by the deployer", async () => {
            const { deployer, cartel } = await loadFixture(deploy);
            expect(await cartel.owner()).to.equal(deployer.address);
        })
    })

    describe("contract addresses", () => {
        it("should have the correct pirexEth address", async () => {
            const { cartel } = await loadFixture(deploy);
            expect(await cartel.pirexEth()).to.equal(pirexEthAddress);
        })

        it("should have the correct pxETH address", async () => {
            const { cartel } = await loadFixture(deploy);
            expect(await cartel.pxEth()).to.equal('0x04C154b66CB340F3Ae24111CC767e0184Ed00Cc6');
        })

        it("should have the correct apxETH address", async () => {
            const { cartel } = await loadFixture(deploy);
            expect(await cartel.apxEth()).to.equal('0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6');
        })
    })

    describe("fees", () => {
        it("should start with default fees", async () => {
            const { cartel, deployer } = await loadFixture(deploy);
            expect(await cartel.depositFeeBps()).to.equal(0);
            expect(await cartel.withdrawFeeBps()).to.equal(0);
        })

        it("should be able to set the deposit fee", async () => {
            const { cartel, deployer } = await loadFixture(deploy);
            await cartel.setDepositFeeBps(10);
            expect(await cartel.depositFeeBps()).to.equal(10);
        })

        it("should be able to set the withdraw fee", async () => {
            const { cartel, deployer } = await loadFixture(deploy);
            await cartel.setWithdrawFeeBps(20);
            expect(await cartel.withdrawFeeBps()).to.equal(20);
        })

        it("should take deposit fee into account when determining mint cost", async () => {
            const { cartel, deployer } = await loadFixture(deploy);
            await cartel.setDepositFeeBps(10);
            expect(await cartel.mintCost()).to.equal(minCost);
            await cartel.mint({value: ethers.parseEther("0.1")});
            
            const fairShare = await cartel.fairPxEthShare();
            const mintCost = await cartel.mintCost();
            expect(mintCost).to.equal(fairShare + fairShare * 10n / 10000n);
        })

        it("should take withdraw fee into account when determining burn payout", async () => {
            const { cartel, deployer } = await loadFixture(deploy);
            await cartel.setWithdrawFeeBps(200);
            await cartel.mint({value: ethers.parseEther("0.1")});
            
            const fairShare = await cartel.fairPxEthShare();
            const burnPayout = await cartel.withdrawPxEthAmount();
            expect(burnPayout).to.equal(fairShare - fairShare * 200n / 10000n);
        })
    })

    describe("apxEthBalance", () => {
        it("should start with zero apxEthBalance", async () => {
            const { cartel } = await loadFixture(deploy);
            expect(await cartel.apxEthBalance()).to.equal(0);
        })

        it("should sweep ETH into apxETH and increase the balance", async () => {
            const { cartel, deployer } = await loadFixture(deploy);
            // send some ETH to the contract
            await deployer.sendTransaction({
                to: cartel.target,
                value: ethers.parseEther("1"),
            }).then(tx => tx.wait());

            // keep track of deployer's balance now
            const deployerBalance = await ethers.provider.getBalance(deployer.address);

            // contract's ETH balance should be 1 ETH
            expect(await ethers.provider.getBalance(cartel.target)).to.equal(ethers.parseEther("1"));

            // contract's apxETH balance should be 0 ETH
            expect(await cartel.apxEthBalance()).to.equal(0);

            // sweep it to apxETH
            await cartel.sweepEth();

            // contract's ETH balance should be zero
            expect(await ethers.provider.getBalance(cartel.target)).to.equal(0);

            // contract's apxETH balance should have increased
            expect(await cartel.apxEthBalance()).to.be.above(0);

            // deployer should have received some of the ETH
            expect(await ethers.provider.getBalance(deployer.address)).to.be.above(deployerBalance);
        })
    })

    describe("mintCost", () => {
        it("should start with original minimum mintCost", async () => {
            const { cartel } = await loadFixture(deploy);
            expect(await cartel.mintCost()).to.equal(minCost);
        })
    })

    describe("mint", () => {
        it("should be able to mint the first one for minCost", async () => {
            const { cartel, deployer } = await loadFixture(deploy);
            await cartel.mint({value: minCost});
            expect(await cartel.balanceOf(deployer.address)).to.equal(1);
            expect(await cartel.ownerOf(1)).to.equal(deployer.address);
        })

        it("should be able to mint multiple times", async () => {
            const { cartel, deployer } = await loadFixture(deploy);
            await cartel.mint({value: ethers.parseEther("0.1")});
            await cartel.mint({value: ethers.parseEther("0.11")});
            await cartel.mint({value: ethers.parseEther("0.12")});
            expect(await cartel.balanceOf(deployer.address)).to.equal(3);
        })

        it("should keep mint cost without fee", async () => {
            const { cartel } = await loadFixture(deploy);
            expect(await cartel.mintCost()).to.equal(minCost);
            await cartel.mint({value: ethers.parseEther("0.1")});
            expect(await cartel.mintCost()).to.equal(minCost);
        })

        it("should increase mint cost once the first mint is made, with fee", async () => {
            const { cartel } = await loadFixture(deploy);
            await cartel.setDepositFeeBps(10);
            await cartel.mint({value: ethers.parseEther("0.1")});
            expect(await cartel.mintCost()).to.be.above(minCost);
        })
    })

    describe("burn", () => {
        it("should be able to burn minted tokens and receive apxETH", async () => {
            const { cartel, apxEth, deployer } = await loadFixture(deploy);

            // caller starts with 0 apxETH
            const callerOriginalApxEthBalance = await apxEth.balanceOf(deployer.address);
            expect(callerOriginalApxEthBalance).to.equal(0);

            await cartel.mint({value: ethers.parseEther("1")});
            const cartelApxEthBalance = await apxEth.balanceOf(cartel.target);

            await cartel.burn(1);
            expect(await cartel.balanceOf(deployer.address)).to.equal(0);
            expect(await cartel.apxEthBalance()).to.equal(0);
            expect(await apxEth.balanceOf(deployer.address)).to.equal(cartelApxEthBalance);
        })

        it("should receive the fair share of apxETH when burning", async () => {
            const { cartel, apxEth, deployer } = await loadFixture(deploy);

            await cartel.mint({value: ethers.parseEther("1")}).then(tx => tx.wait());
            await cartel.mint({value: ethers.parseEther("1.1")}).then(tx => tx.wait());
            await cartel.mint({value: ethers.parseEther("1.2")}).then(tx => tx.wait());
            const cartelApxEthBalance = await apxEth.balanceOf(cartel.target);
            const fairShare = cartelApxEthBalance / 3n;
            expect(await cartel.withdrawApxEthAmount()).to.equal(fairShare);

            await cartel.burn(1);
            expect(await apxEth.balanceOf(deployer.address)).to.equal(fairShare);
            expect(await cartel.apxEthBalance()).to.equal(cartelApxEthBalance - fairShare);
        })
    })
})