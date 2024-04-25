/** @jsxImportSource frog/jsx */
import { db } from "./db";
import { Button, Frog } from "frog";
// import { pinata } from 'frog/hubs'
import { handle } from "frog/next";
import { shuffle } from "lodash";
import getClient from "~~/app/common/manager";
import { getUser } from "~~/utils/getUser";
import { startQuiz } from "~~/utils/startQuiz";
import { claimRewards, completeQuiz } from "./contract";
type State = {
  user: string;
  quizId: string;
  score: number;
  quizIndex: number;
  questions: any[];
};

const app = new Frog<{ State: State }>({
  assetsPath: "/",
  basePath: "/api",
  // hub: pinata(),
  initialState: {
    user: "",
    quizId: "",
    score: 0,
    quizIndex: 0,
    questions: [],
  },
});

let requestedHash: any;




const Image = ({ content, options }: { content: any[]; options: any }) => (
  <div
    style={{
      alignItems: "center",
      backgroundSize: "100% 100%",
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      height: "100%",
      justifyContent: "center",
      textAlign: "center",
      width: "100%",
      ...options,
    }}
  >
    {content}
  </div>
);

app.frame("/", async c => {
  const { buttonValue, status } = c;

  const { searchParams } = new URL(c.req.url);
  const hash = searchParams.get("hash");



  if (status === "response" && buttonValue?.startsWith('0x')) {

  const buttonValue = c.buttonValue;

  if (buttonValue) {
    const fid = c.frameData?.fid;

  const state = await c.deriveState(async previousState => {
    
      previousState.quizId = buttonValue;
      // console.log(previousState.questions)
    
  });

    // Check if fid exists
    if (fid) {
      // Fetch user information
      getUser(fid)
        .then(userInfo => {

          // User info successfully fetched
          console.log("User info:", userInfo);
          state.user = userInfo?.verifiedAddress[0];

            // Start quiz with the retrieved hash
            getClient()
              .then(client => startQuiz(buttonValue, fid, client))
              .then(start => {
                // Quiz started successfully
                requestedHash = start;
              })
              .catch(error => {
                // Handle start quiz error
                console.error("Error starting quiz:", error);
              });
        })
        .catch(error => {
          // Handle user info fetch error
          console.error("Error fetching user info:", error);
        });
      } else {
        // Handle missing fid
        console.error("Frame data fid is missing");
      }
    } else {
      // Handle missing button value
      console.error("Button value is missing");
    }

  
  

    return c.res({
      action: "/quiz",
      image: (
        <Image
          content={["Great! Select quiz difficulty 👻"]}
          options={{ color: "white", fontSize: 24, padding: "0 120px" }}
        />
      ),
      imageOptions: { width: 600, height: 600 },
      intents: [
        <Button key={"easy"} value="easy">
          Beginner
        </Button>,
        <Button key={"medium"} value="medium">
          Intermediate
        </Button>,
        <Button key={"hard"} value="hard">
          Advanced
        </Button>,
      ],
    });
  } else {
    // Default welcome message with "Start Quiz" button
    return c.res({
      image: <Image content={["Are you ready?"]} options={{ color: "white", fontSize: 60, padding: "0 120px" }} />,
      imageOptions: { width: 600, height: 600 },
      intents: [
        <Button
          key={"start"}
          value={`${hash}`}>
          Start Quiz ⚡
        </Button>,
      ],
    });
  }
});

// Quiz frame
app.frame("/quiz", async c => {
  const { buttonValue, deriveState } = c;


  // Derive new state based on previous state
  const state = await deriveState(async previousState => {
    // Fetch questions if not fetched previously
    if (previousState.questions.length < 1) {
      previousState.questions = (await db.getQuestionsByDifficulty(
        buttonValue as "Easy" | "Medium" | "Hard",
        requestedHash,
      )) as unknown as any[];
    }
  });

  if (buttonValue === "continue") {
    // Move to the next question
    state.quizIndex++;
    // Check if all questions have been answered
    if (state.quizIndex === state.questions.length) {
      // Handle recording of user score, eligibility for rewards, and smart contract interactions
      const userScore = state.score;
      console.log("User score:", userScore);

      let isEligibleForRewards = false;
      const fid = c.frameData?.fid;
      if (fid) {
        
        getUser(fid)
          .then(userInfo => {
            completeQuiz(state.user, state.quizId, state.score)
            claimRewards(fid, state.quizId, userInfo?.verifiedAddress);
          });
      }
               
            
      if (isEligibleForRewards) {
        // Record user score and eligibility for rewards in smart contract
        // Inform the user about rewards
        return c.res({
          image: (
            <Image
              content={[<div>Congratulations! 🎉</div>, <div>You are eligible for rewards. 🏆</div>]}
              options={{ color: "white", fontSize: 54, padding: "0 120px", gap: 20 }}
            />
          ),
          intents: [<Button.Reset key={"reset"}>Restart</Button.Reset>],
        });
      } else {
        // Inform the user about no rewards
        return c.res({
          image: (
            <Image
              content={[<div>{"Quiz Completed 🎉"}</div>, <div>{"Thank you for taking the quiz!"}</div>]}
              options={{ color: "white", fontSize: 54, padding: "0 120px" }}
            />
          ),
          intents: [<Button.Reset key={"reset"}>Restart</Button.Reset>],
        });
      }
    }
  }

  // Get the current question based on the quiz index
  const currentQuestion = state.questions[state.quizIndex];
  // console.log(state.questions)

  // Handle user response
  if (
    buttonValue &&
    currentQuestion &&
    currentQuestion.options &&
    currentQuestion.options.map((option: string) => option.toLowerCase()).includes(buttonValue.toLowerCase())
  ) {
    const isCorrect = buttonValue === currentQuestion.correctAnswer.toLowerCase();
    if (isCorrect) {
      // Update the score if the answer is correct
      state.score++;
    }
    // show correct answer and continue button
    return c.res({
      image: (
        <Image
          content={[
            <div>{isCorrect ? "Correct! 🎉" : "Incorrect 🙁"}</div>,
            <div>{currentQuestion && currentQuestion.question}</div>,
            <div>{`${currentQuestion.correctAnswer}`}</div>,
          ]}
          options={{ color: "white", fontSize: 44, padding: "0 120px", gap: 20 }}
        />
      ),
      intents: [
        <Button key={"continue"} value="continue">
          Continue
        </Button>,
      ],
    });
  }

  // Display the question and answer options
  const shuffledOptions = shuffle(currentQuestion.options);
  return c.res({
    image: (
      <Image
        content={[
          <div>{currentQuestion && currentQuestion.question}</div>,
          // <div>{currentQuestion && currentQuestion.options.join(', ')}</div>,
        ]}
        options={{ color: "white", fontSize: 44, padding: "0 120px", gap: 20 }}
      />
    ),
    intents: shuffledOptions.map((option: any) => (
      <Button key={option} value={option.toLowerCase()}>
        {option}
      </Button>
    )),
  });
});

export const GET = handle(app);
export const POST = handle(app);


export const dynamic = 'force-dynamic';
