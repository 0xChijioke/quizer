"use server";

import { Readable } from 'stream';
import { pinata } from '~~/app/common/config';





const pinDataWithPinata = async (data: any) => {
  if (!data) {
    throw new Error("Data is empty or invalid.");
  }

  const dataStream = Readable.from([data]);
  
  // Pin the concatenated data to IPFS by hash with metadata including a name
  const options = {
    pinataMetadata: {
      name: "QuizData",
    },
  };

  // Pin the concatenated data to IPFS by hash with metadata
  const { IpfsHash } = await pinata.pinFileToIPFS(dataStream, options);

  return IpfsHash;
  };

export { pinDataWithPinata };
