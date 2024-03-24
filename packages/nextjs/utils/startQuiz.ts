import deployedContracts from "~~/contracts/deployedContracts";



const startQuiz = async (hash: string, user: any, client: any) => {
    try {
        // Authenticate the user
               
        
        const quiz = await client.writeContract({
            address: deployedContracts[84532].Quizer.address,
            abi: deployedContracts[84532].Quizer.abi,
            functionName: 'startQuiz',
            args: [user, hash]
        })
        
        console.log("Quiz started successfully", quiz);

        
        return quiz;
    } catch (error) {
        console.error("Error starting quiz:", error);
        throw error;
    }
};

export { startQuiz }