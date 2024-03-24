import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract, formatEther } from "ethers";

/**
 * Deploys a contract named "Quizer" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployQuizer: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
  On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
    */

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("Quiz", {
    from: deployer,
    args: ["Quiz", "QZ"],
    log: true,
    autoMine: true,
  });

  const Quiz = await hre.ethers.getContract<Contract>("Quiz", deployer);

  const quizAddress = await Quiz.getAddress();

  await deploy("Quizer", {
    from: deployer,
    args: [quizAddress],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const Quizer = await hre.ethers.getContract<Contract>("Quizer", deployer);
  console.log("👋 ", await Quizer.owner());
  console.log("👋 Owner balance ", formatEther(await Quiz.balanceOf(deployer)));
};

export default deployQuizer;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Quizer
deployQuizer.tags = ["Quizer", "Quiz"];
