import { log } from "console";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import getClient from "~~/app/common/manager";
import deployedContracts from "~~/contracts/deployedContracts";

export const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
});


const completeQuiz = async (user: any, quizId: string, score: number) => {
    try {

        const client = await getClient();
        // Call the completeQuiz function
        // console.log("user", user, "quizId", quizId, "score", score, "client", client);
        const { request } = await publicClient.simulateContract({
            address: deployedContracts[84532].Quizer.address,
            abi: deployedContracts[84532].Quizer.abi,
            functionName: 'completeQuiz',
            args: [user, quizId as any, score as any],
            account: client.account,
        });
        
        // console.log("request", request);
        const transactionHash = await client.writeContract(request);
        console.log("Quiz completed successfully with transaction hash:", transactionHash);
        return transactionHash;
    } catch (error) {
        console.error("Error completing quiz:", error);
        throw error;
    }
};

const claimRewards = async (user: any, quizId: string, address: string) => {
    try {
        const client = await getClient();
        // Call the claimReward function
        console.log("user", user, "quizId", quizId, "client", client, "address", address);
        const { request } = await publicClient.simulateContract({
            address: deployedContracts[84532].Quizer.address,
            abi: deployedContracts[84532].Quizer.abi,
            functionName: 'claimReward',
            args: [user, quizId as any, address],
            account: client.account,
        });
        // console.log("request", request);
        
        const transactionHash = await client.writeContract(request);

        const logs = await publicClient.getContractEvents({
            address: deployedContracts[84532].Quizer.address,
            abi: deployedContracts[84532].Quizer.abi,
            eventName: 'RewardClaimed', 
        })
        console.log("Rewards claimed successfully with transaction hash:", logs[0].args.rewardAmount);
        return logs[0].args.rewardAmount;
    } catch (error) {
        console.error("Error claiming rewards:", error);
        throw error;
    }
};

export { completeQuiz, claimRewards };
