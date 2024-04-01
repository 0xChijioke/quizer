import axios from "axios";

// Cached variable to hold questions
let cachedQuestions: any[] | null = null;


function readHashFromEnvironment() {
  return process.env.HASH_VALUE || null;
}

// Function to fetch and return questions by difficulty
export const db = {
  getQuestionsByDifficulty: async (difficulty: "Easy" | "Medium" | "Hard", requestedHash: any) => {
    try {
      // If questions are already cached, return them directly
      if (cachedQuestions && cachedQuestions.length > 0) {
        const filteredCachedQuestions = cachedQuestions.filter(question => question.difficulty === difficulty);
        if (filteredCachedQuestions.length >= 5) {
          return filteredCachedQuestions.slice(0, 5);
        }
      }

      let hash;

      // // If requestedHash is provided, use it instead of the stored hash
      if (requestedHash) {
        hash = requestedHash;
      } else {
        hash = readHashFromEnvironment();
      }
;
      const questions = hash && (await fetchQuestions(hash));

      // Cache the fetched questions only if questions are fetched
      if (questions) {
        cachedQuestions = questions;
      } else if (!cachedQuestions) {
        throw new Error("Failed to fetch questions and cache is empty");
      }

      // Log the fetched questions for debugging
      // console.log('Fetched questions:', cachedQuestions);

      // Filter the fetched questions based on the requested difficulty level
      const filteredQuestions = cachedQuestions.filter(
        question => question.difficulty.toLowerCase() === difficulty.toLowerCase(),
      );

      // console.log("filteredQuestions", filteredQuestions);
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
