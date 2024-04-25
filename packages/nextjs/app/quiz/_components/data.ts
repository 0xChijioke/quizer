"use server";

import { pinata } from '~~/app/common/config';



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

export { pinDataWithPinata };
