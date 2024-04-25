
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";
import { pinata } from "~~/app/common/config";


  
export const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });


const startQuiz = async (hash: string, user: any, client: any) => {
    try {

        const { request } = await publicClient.simulateContract({
            address: deployedContracts[84532].Quizer.address,
            abi: deployedContracts[84532].Quizer.abi,
            functionName: 'startQuiz',
            args: [user, hash as any],
            account: client.account,
          })
          // console.log("request", request)
      
      
          const quiz = await client.writeContract(request);
        //   console.log(quiz);
          
          const receipt = await publicClient.waitForTransactionReceipt({ hash: quiz})
               
        console.log("Quiz started successfully");
         
        const logs = await publicClient.getContractEvents({
            address: deployedContracts[84532].Quizer.address,
            abi: deployedContracts[84532].Quizer.abi,
            eventName: 'QuizStarted', 
        })

        const data = logs[0].args.quizHash && await pinata.pinByHash(logs[0].args.quizHash);

        console.log(logs[0])

        return logs[0].args.quizHash;
    } catch (error) {
        console.error("Error starting quiz:", error);
        throw error;
    }
};

export { startQuiz }