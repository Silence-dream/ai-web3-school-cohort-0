const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeFiAdvisor", function () {
  let advisor, owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const DeFiAdvisor = await ethers.getContractFactory("DeFiAdvisor");
    advisor = await DeFiAdvisor.deploy();
    await advisor.waitForDeployment();
  });

  describe("创建策略", function () {
    it("应该能创建一条新策略", async function () {
      await expect(
        advisor.connect(user1).createStrategy("lending", "USDC-ETH", "建议存入 AAVE")
      )
        .to.emit(advisor, "StrategyCreated")
        .withArgs(1, user1.address, "lending", "USDC-ETH");

      expect(await advisor.strategyCounter()).to.equal(1);
    });

    it("应该能查询策略详情", async function () {
      await advisor.connect(user1).createStrategy("staking", "ETH", "建议质押到 Lido");

      const strategy = await advisor.getStrategy(1);
      expect(strategy.strategyType).to.equal("staking");
      expect(strategy.tokenPair).to.equal("ETH");
      expect(strategy.executed).to.equal(false);
    });
  });

  describe("执行策略", function () {
    it("用户可以执行自己的策略", async function () {
      await advisor.connect(user1).createStrategy("liquidity", "USDC-ETH", "添加流动性");
      await advisor.connect(user1).executeStrategy(1);

      const strategy = await advisor.getStrategy(1);
      expect(strategy.executed).to.equal(true);
    });

    it("不能执行别人的策略", async function () {
      await advisor.connect(user1).createStrategy("lending", "USDC", "存款");

      await expect(advisor.connect(owner).executeStrategy(1)).to.be.revertedWith(
        "Not your strategy"
      );
    });
  });

  describe("查询函数", function () {
    it("应该返回用户的策略列表", async function () {
      await advisor.connect(user1).createStrategy("lending", "USDC", "建议1");
      await advisor.connect(user1).createStrategy("staking", "ETH", "建议2");

      const ids = await advisor.getUserStrategies(user1.address);
      expect(ids.length).to.equal(2);
      expect(ids[0]).to.equal(1);
      expect(ids[1]).to.equal(2);
    });
  });
});
