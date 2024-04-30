import axios from "axios";

export const db = {
  getQuestionsByDifficulty: async (difficulty: "Easy" | "Medium" | "Hard" | "Any", requestedHash: any) => {
    try {
      let hash;

      if (requestedHash) {
        hash = requestedHash;
      } else {
        throw new Error("Hash of the quiz is required");
      }

      const questions = await fetchQuestions(hash);


      // Filter the fetched questions based on the requested difficulty level
      let filteredQuestions = questions.filter(
        question => question.difficulty.toLowerCase() === difficulty.toLowerCase() || "Any".toLowerCase(),
      );
      // Check if filteredQuestions is empty after filtering
      if (filteredQuestions.length === 0) {
        throw new Error("No questions found for the requested difficulty");
      }

      shuffleArray(filteredQuestions);

      // Return a subset of 5 questions
      return filteredQuestions.slice(0, 5);
    } catch (error) {
      console.error("Error fetching questions by difficulty:", error);
      throw error;
    }
  },
};

// Function to fetch questions from Pinata using the provided IPFS CID
async function fetchQuestions(ipfsCID: string): Promise<any[]> {
  try {
    // Pinata's public gateway URL
    const pinataGatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsCID}`;

    // Fetch questions data from Pinata using the public gateway
    const response = await axios.get(pinataGatewayUrl);

    // Extract questions from the response data
    const questions = response.data;

    return questions;
  } catch (error) {
    console.error("Error fetching questions from Pinata:", error);
    throw error;
  }
}

// Function to shuffle an array
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
