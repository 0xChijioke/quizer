const PINATA_API = process.env.PINATA_API_KEY;

export async function getUser(fid: any) {
  // Define the Pinata API endpoint
  const pinataAPI = `https://api.pinata.cloud/v3/farcaster/users/${fid}`;

  // Define the request headers
  const headers = {
    Authorization: `Bearer ${PINATA_API}`,
  };

  try {
    // Make the GET request to the Pinata API
    const response = await fetch(pinataAPI, {
      method: "GET",
      headers: headers,
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Extract the user info we are interested in
    const userInfo = {
      userName: data.data.username,
      verifiedAddress: data.data.verifications[0] || null,
      custodyAddress: data.data.custody_address,
    };

    // Return the user info
    return userInfo;
  } catch (error: any) {
    // Handle any errors
    console.error("Error fetching user data:", error.message);
    return null;
  }
}
