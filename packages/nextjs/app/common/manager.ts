'use server'


import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import { hardhat } from 'viem/chains';



const getClient = async () => {
    try {
        const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;

        if (!privateKey) {
            throw new Error('Private key is missing');
        }
        const account = privateKeyToAccount(privateKey as `0x${string}`);

        const client = createWalletClient({
            account,
            chain: hardhat,
            transport: http()
        });

        return client;
    } catch (error) {
        console.error('Error creating wallet client:', error);
        throw error;
    }
};

// Export the async function to be used in "use server" file
export default getClient;