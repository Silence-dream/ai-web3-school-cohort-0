const hre = require("hardhat");

async function main() {
  console.log("🚀 开始部署 DeFiAdvisor 合约...\n");

  // 获取部署者信息
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("📋 部署者信息:");
  console.log(`   地址: ${deployer.address}`);
  console.log(`   余额: ${hre.ethers.formatEther(balance)} ETH\n`);

  // 部署合约
  const DeFiAdvisor = await hre.ethers.getContractFactory("DeFiAdvisor");
  const advisor = await DeFiAdvisor.deploy();

  await advisor.waitForDeployment();
  const address = await advisor.getAddress();

  console.log("✅ DeFiAdvisor 已部署!");
  console.log(`   合约地址: ${address}\n`);

  // 验证部署
  const counter = await advisor.strategyCounter();
  console.log("🔍 合约验证:");
  console.log(`   初始策略数: ${counter}`);
  console.log(`   合约 owner: ${await advisor.owner()}`);

  console.log("\n🎉 部署完成！可以开始使用了。");
}

main().catch((error) => {
  console.error("❌ 部署失败:", error);
  process.exitCode = 1;
});
