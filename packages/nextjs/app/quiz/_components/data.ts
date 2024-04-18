"use server";

import { Readable } from 'stream';
import { pinata } from '~~/app/common/config';


const pinDataWithPinata = async (data: any) => {
  if (!data) {
    throw new Error("Data is empty or invalid.");
  }

  const bufferData = JSON.stringify(data);

  const dataStream = Readable.from(bufferData);

  const options = {
    pinataMetadata: {
      name: "QuizData",
    },
  };

  const { IpfsHash } = await pinata.pinFileToIPFS(dataStream, options);

  console.log(IpfsHash)

  return IpfsHash;
  };

export { pinDataWithPinata };
