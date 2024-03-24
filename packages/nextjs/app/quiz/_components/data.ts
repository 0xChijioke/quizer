"use server";

import PinataClient from "@pinata/sdk";
import { Readable } from 'stream';
import { encrypt } from "ethereum-cryptography/aes.js";
import { getRandomBytesSync } from "ethereum-cryptography/random.js";
import { hexToBytes, utf8ToBytes } from "ethereum-cryptography/utils.js";

const privateKeyString = process.env.PRIVATE_KEY32;

const pinataConfig = {
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
};

const pinata = new PinataClient(pinataConfig);








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

    // console.log('IV:', iv);
    // console.log('encryptedData:', encryptedData);

    return { encryptedData, iv };
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw new Error("Error encrypting data.");
  }
};

const pinDataWithPinata = async (encryptedData: any, iv: any) => {
  if (!encryptedData || !iv) {
    throw new Error("Encrypted data or IV is empty or invalid.");
  }

  // Convert the IV and encrypted data to Buffers
  const ivBuffer = Buffer.from(iv);
  const encryptedBuffer = Buffer.from(encryptedData);

  // Concatenate the IV and encrypted data into a single Buffer
  const dataToPin = Buffer.concat([ivBuffer, encryptedBuffer]);

  
  const dataStream = Readable.from([dataToPin]);
  
  // Pin the concatenated data to IPFS by hash with metadata including a name
  const options = {
    pinataMetadata: {
      name: "EncryptedQuizData", //TODO: Provide a name for the pinned file
    },
  };

  // Pin the concatenated data to IPFS by hash with metadata
  const { IpfsHash } = await pinata.pinFileToIPFS(dataStream, options);

  return IpfsHash;
  };

export { encrptData, pinDataWithPinata };
