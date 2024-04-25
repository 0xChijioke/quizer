"use client";

// import { useAccount } from "wagmi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { pinDataWithPinata } from "./_components/data";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContractWrite, useScaffoldEventHistory, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import CopyToClipboard from "react-copy-to-clipboard";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { useAccount } from "wagmi";


const metadata = getMetadata({
  title: "Create Quiz",
  description: "create a quiz and share it with your friends.",
});

const Home: NextPage = () => {
  const {address} = useAccount();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `${process.env.NEXT_PUBLIC_VERCEL_URL}/api?hash=`
    : 'http://localhost:3000/api/dev?hash=';

    

  
  const [questionNumber, setQuestionNumber] = useState(1);
  const [formData, setFormData] = useState({
    question: "",
    options: ["", ""], // Two mandatory options
    correctAnswer: "",
    difficulty: "Any", // default difficulty
  });

  const [quizData, setQuizData] = useState<any[]>([]); // Hold validated questions
  const [hash, setHash] = useState<string>("");
  const [threshold, setThreshold] = useState<bigint>(BigInt('80')); // set threshold to 80% for now
  
  const [loading, setLoading] = useState<boolean>(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);






  
  const { writeAsync, isLoading, isMining } = useScaffoldContractWrite({
    contractName: "Quizer",
    functionName: "createQuiz",
    args: [hash, threshold],
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });
  // console.log('data, iserror, issuccess', data, isError, isSuccess)
  
  
  
    useScaffoldEventSubscriber({
      contractName: "Quizer",
      eventName: "QuizCreated",
      
      listener: logs => {
        logs.map(log => {
          const { quizId } = log.args;
          console.log("📡 Quiz Id", quizId);
          quizId && setQuizId(quizId as any);
        });
      },
    });

    const {
      data: events,
      isLoading: isLoadingEvents,
      error: errorReadingEvents,
    } = useScaffoldEventHistory({
      contractName: "Quizer",
      eventName: "QuizCreated",
      fromBlock: 1n,
      watch: true,
      filters: { creator: address },
      blockData: true,
      transactionData: true,
      receiptData: true,
    });
    // console.log(events)
  
  
  
  
    useScaffoldEventSubscriber({
      contractName: "Quizer",
      eventName: "QuizCompleted",
  
      listener: (logs): void => {
        logs.map(log => {
          const { fid, quizId, timestamp } = log.args;
          // console.log("📡 GreetingChange event", quizId, fid, timestamp);
        });
      },
    });
    
  
  
  
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    };
  
    const handleOptionChange = (index: number, value: string) => {
      setFormData(prevState => {
        const newOptions = [...prevState.options];
        newOptions[index] = value;
        return {
          ...prevState,
          options: newOptions,
        };
      });
    };
  
    const handleEnterNextQuestion = () => {
      if (
        formData.question.trim() === "" ||
        formData.options.length < 2 ||
        formData.options.some(option => option.trim() === "")
      ) {
        alert("Please fill out the current question and provide at least two options.");
        return; 
      }
  
      if (formData.options.length < 2 || formData.options.length > 4) {
        alert("Please add between 2 to 4 options.");
        return;
      }
  
      // Validate unique options
      const uniqueOptions = new Set(formData.options);
      if (uniqueOptions.size !== formData.options.length) {
        alert("Options must be unique.");
        return;
      }
  
      if (!formData.options.includes(formData.correctAnswer)) {
        alert("The correct answer must be one of the options provided.");
        return;
      }
      // Validated question
      const validatedQuestion = {
        question: formData.question,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        difficulty: formData.difficulty,
      };
  
      // Add validated question to quiz data
      setQuizData(prevQuizData => [...prevQuizData, validatedQuestion]);
  
      // Reset form data
      setFormData({
        question: "",
        options: ["", ""],
        correctAnswer: "",
        difficulty: "Any",
      });
  
      // Increment question number
      setQuestionNumber(prevQuestionNumber => prevQuestionNumber + 1);
    };
  
  
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Validate and format the final submission
      setLoading(true);
      try {
  
        const ipfshash = await pinDataWithPinata(quizData);
  
        setHash(ipfshash);
  
        // Call the startQuiz function in the smart contract
        await writeAsync();
  
        setFormData({
          question: "",
          options: ["", ""],
          correctAnswer: "",
          difficulty: "Any",
        });
        setQuestionNumber(1);
        setQuizId(null); // Reset quizId
        setCopied(false);
  
  
      } catch (error) {
        console.error("Error handling form submission:", error);
        // Handle any errors that occur during form submission
      } finally {
        setLoading(false);
      }
    };
  



  return (
    <>
        <div className="flex items-center max-w-full flex-col pt-10">
          <div className="flex flex-col items-center w-full card lg:w-[50%] bg-base-100 shadow-md shadow-secondary p-4 lg:p-8 justify-center">
            {quizId && (
              <dialog id="my_modal" className="modal" open>
                <div className="modal-box w-11/12 max-w-3xl">                    
                  <button
                    type="button"
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => {
                      const myModal = document.getElementById("my_modal") as HTMLDialogElement | null;
                      if (myModal) {
                        myModal.close();
                        setQuizId(null);
                      }
                    }}
                  >
                    ✕
                  </button>
                  <h3 className="font-bold text-lg">Quiz Created!</h3>
                  <p className="py-4">Here is the URL: {apiUrl + quizId}</p>
                  <CopyToClipboard text={apiUrl + quizId} onCopy={() => setCopied(true)}>
                    <button className="btn btn-primary" onClick={() => setCopied(true)}>
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </CopyToClipboard>
                  <p className="text-sm">Please copy or store this link to cast your quiz as a frame before closing the page.</p>
                </div>
              </dialog>
            )}
            <div className="items-center p-3 bg-opacity-10 rounded-lg flex justify-center w-full bg-slate-400">
              <h1 className="text-lg font-bold gap-x-4 flex tracking-wide whitespace-nowrap text-right">
              gm <Address address={address} />
              </h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="mb-4">Enter Question {questionNumber}</p>
              <div className="flex flex-col justify-end">
                <label htmlFor="difficulty" className="text-sm font-light">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={e => setFormData(prevState => ({ ...prevState, difficulty: e.target.value }))}
                  className="select select-bordered my-2 select-secondary rounded-md"
                >
                  <option value="Any">Any</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleChange}
                className="w-full border input input-primary bg-transparent rounded px-2 py-2 mb-4"
                required
                placeholder="Enter your question here."
              />
              {formData.options.map((option, index) => (
                <input
                  type="text"
                  key={index}
                  value={option}
                  onChange={e => handleOptionChange(index, e.target.value)}
                  className="w-full border input input-primary bg-transparent rounded px-2 py-1 mb-2"
                  required
                  placeholder={`Option ${index + 1}`}
                />
              ))}
              {formData.options.length < 4 && (
                <button
                  type="button"
                  onClick={() => setFormData(prevState => ({ ...prevState, options: [...prevState.options, ""] }))}
                  className="bg-indigo-800 text-white px-4 py-2 rounded mt-4"
                >
                  Add Option
                </button>
              )}
              <input
                type="text"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                className="w-full border input input-primary bg-transparent rounded px-2 py-1 mb-4"
                required
                placeholder="Enter the correct answer."
              />
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleEnterNextQuestion}
                  disabled={formData.question.trim() === '' || formData.options.length < 2 || formData.options.some(option => option.trim() === '')}
                  className="bg-indigo-800 text-white px-4 py-2 rounded"
                >
                  Next Question
                </button>
                {questionNumber >= 1 && (
                  <button type="submit" className="btn btn-primary text-white px-4 py-2 rounded ml-4">
                    {isLoading  || loading ? "Loading..." : isMining ? "Mining..." : "Submit Quiz"  }
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
    </>
  );
};

export default Home;
