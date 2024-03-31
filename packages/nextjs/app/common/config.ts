import PinataClient from "@pinata/sdk";

const pinataConfig = {
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
};

export const pinata = new PinataClient(pinataConfig);
