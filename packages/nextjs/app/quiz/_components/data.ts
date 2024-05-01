"use server";

import { pinata } from '~~/app/common/config';

import { encrypt } from "ethereum-cryptography/aes.js";
import { getRandomBytesSync } from "ethereum-cryptography/random.js";
import { hexToBytes, utf8ToBytes } from "ethereum-cryptography/utils.js";

const privateKeyString = process.env.PRIVATE_KEY32;





const encrptData = async (data: any) => {
  if (!data || Object.keys(data).length === 0) {
    throw new Error("Data is empty or invalid.");
  }

  try {
    if (!privateKeyString) {
      throw new Error("KEY is undefined.");
    }

    // Convert data to Uint8Array
    const dataBytes = utf8ToBytes(JSON.stringify(data));

    const privateKeyBytes = hexToBytes(privateKeyString);

    // Generate IV
    const iv = getRandomBytesSync(16);

    // Encrypt the data
    const encryptedData = await encrypt(dataBytes, privateKeyBytes, iv);


    return { encryptedData, iv };
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw new Error("Error encrypting data.");
  }
};

const pinDataWithPinata = async (data: any) => {
  if (!data) {
    throw new Error("Data is empty or invalid.");
  }

  const options = {
    pinataMetadata: {
      name: "QuizData",
    },
  };

  const { IpfsHash } = await pinata.pinJSONToIPFS(data, options);

  return IpfsHash;
  };

export { pinDataWithPinata, encrptData };
