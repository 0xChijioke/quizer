//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// openzeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


/**
 * A smart contract that allows users to create quizzes and earn rewards for completing them.
 * It allows the owner to manage quizzes, quiz metadata, and user activities.
 */
contract Quizer is Ownable {
    using Strings for uint256;

    IERC20 private quizToken;
    address private tokenAddress;
    

	// State Variables

	// Structure to represent user data
    struct UserData {
        address userAddress; // User's verified address
        uint256 score;       // User's score
    }

    // Structure to represent quiz data
    struct Quiz {
        string quizHash;    // IPFS hash of the quiz content
        uint256 threshold;     // Reward threshold for the quiz
        address creator;    // Creator of the quiz
    }

    struct QuizAttempt {
        QuizState state; // State of the quiz attempt
        uint256 score;  // Score achieved by the user
        uint256 startTime; // Time when the quiz was started
        uint256 completionTime; // Time when the quiz was completed
        bool eligible; // Flag indicating if the user is eligible for a reward
        bool rewardClaimed; // Flag indicating if the reward was claimed
        bool restarted; // Flag indicating if the quiz attempt was restarted
    }

    
    
    // Enum to represent the state of a quiz attempt
    enum QuizState { NotStarted, InProgress, Completed }


    // Mapping to store quiz attempts for each user
    mapping(uint256 => mapping(bytes32 => QuizAttempt)) private userQuizAttempts;





    // Mapping to store IPFS hash with its associated identifier
    mapping(bytes32 => Quiz) private quizzes;

    // Mapping to store user data with their FID
    mapping(uint256 => UserData) private userData;

    // Mapping to store quiz attempts for each user
    mapping(uint256 => bytes32[]) private userQuizIds;

    

    
    // Event to emit when IPFS hash is stored
    event QuizCreated(bytes32 indexed quizId, address indexed creator);

    // Event to emit when a user requests to take a quiz
    event QuizStarted(uint256 indexed fid, bytes32 indexed quizId, uint256 timestamp, string quizHash);

    // Event to emit when a user completes a quiz
    event QuizCompleted(uint256 indexed fid, bytes32 indexed quizId, uint256 score, uint256 timestamp, bool eligible);


    // Event to emit when a user completes a quiz and earns reward
    event RewardClaimed(uint256 indexed fid, bytes32 quizId, uint256 rewardAmount);




	// Event to emit when user data is updated
    event UserDataUpdated(uint256 indexed fid, address indexed userAddress);

	// Event to emit when user score is updated
    event UserScoreUpdated(uint256 indexed fid, address, uint256 score);





    /**
     * @dev Constructor function.
     * @param _tokenAddress The address of the ERC20 token used for rewards.
     */
    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
        quizToken = IERC20(tokenAddress);
    }




    /**
     * @dev Function to create a new quiz.
     * @param _quizHash IPFS hash of the quiz content.
     * @param _threshold Reward threshold for the quiz.
     */
    function createQuiz(string memory _quizHash, uint256 _threshold) external {
        // require(_threshold > 10 && _threshold <= 100, "Invalid threshold percentage");
        console.log(_quizHash);
        // Generate keccak256 hash of the IPFS hash
        bytes32 quizId = keccak256(abi.encodePacked(_quizHash, _threshold, msg.sender));

        // Store hash in the mapping
        quizzes[quizId] = Quiz(_quizHash, _threshold, msg.sender);

        // Emit event
        emit QuizCreated(quizId, msg.sender);

    }




    /**
     * @dev Function to start a quiz attempt.
     * @param _fid Identifier of the user.
     * @param _quizId Identifier of the quiz.
     */
    function startQuiz(uint256 _fid, bytes32 _quizId) external {
        // Check if the quizId is valid

        // Check if the user's fid exists, if not, update user data
        if (userData[_fid].userAddress == address(0)) {
            _updateUserData(_fid, address(0), 0); 
        }




        // Check if the user has not already started the quiz
        require(userQuizAttempts[_fid][_quizId].state == QuizState.NotStarted, "Quiz already in progress or completed");

        
        
        // Add the quizId to the user's list of attempts
        userQuizIds[_fid].push(_quizId);

        // Get the quiz struct
        Quiz memory quiz = _getQuiz(_quizId);

        console.log(quiz.quizHash);

        userQuizAttempts[_fid][_quizId].state = QuizState.InProgress;
        userQuizAttempts[_fid][_quizId].startTime = block.timestamp;

        emit QuizStarted(_fid, _quizId, block.timestamp, quiz.quizHash);

    }




    /**
     * @dev Allows a user to restart a quiz attempt.
     * @param _fid Identifier of the user.
     * @param _quizId Identifier of the quiz.
     */
    function restartQuiz(uint256 _fid, bytes32 _quizId) external {
        require(userQuizAttempts[_fid][_quizId].state == QuizState.InProgress || userQuizAttempts[_fid][_quizId].state == QuizState.Completed, "Quiz not Started");
        require(!userQuizAttempts[_fid][_quizId].restarted, "Quiz already restarted");

        userQuizAttempts[_fid][_quizId].restarted = true;
    }



    /**
     * @dev Allows the owner to complete a quiz attempt.
     * @param _fid Identifier of the user.
     * @param _quizId Identifier of the quiz.
     * @param _score Score obtained by the user.
     */
    function completeQuiz(uint256 _fid, bytes32 _quizId, uint256 _score) external {
        // Check if the user has started the quiz
        require(userQuizAttempts[_fid][_quizId].state == QuizState.InProgress, "Quiz not started");

        QuizAttempt storage attempt = userQuizAttempts[_fid][_quizId];


        // Normalize the score to a percentage
        uint256 normalizedScore = (_score * 100) / 5; // total of 5

        uint256 adjustedScore;
        

        if (attempt.restarted) {
            // 30% reduction for restarted quiz
            adjustedScore = (normalizedScore * 7) / 10;

        } else {
            adjustedScore = normalizedScore; // Full score if not restarted
        }


        // Check if the user's score meets the reward threshold
        if (adjustedScore >= 80) { // Threshold set at 80%
            // Mark reward as claimable
            userQuizAttempts[_fid][_quizId].eligible = true;
        }


        
        // Update cumulative score in userData
        uint256 cumulativeScore = calculateCumulativeScore(_fid);
        userData[_fid].score = cumulativeScore;

        // Update attempt data
        attempt.state = QuizState.Completed;
        attempt.score = adjustedScore;
        attempt.completionTime = block.timestamp;


        // Emit QuizCompleted event
        emit QuizCompleted(_fid, _quizId, adjustedScore, block.timestamp, userQuizAttempts[_fid][_quizId].eligible);

    }




    /**
     * @dev Calculates the cumulative score of a user.
     * @param fid Identifier of the user.
     * @return The cumulative score.
     */
    function calculateCumulativeScore(uint256 fid) public view returns (uint256) {
        uint256 totalScore = 0;
        uint256 totalPossibleScore = userQuizIds[fid].length * 100;

        for (uint256 i = 0; i < userQuizIds[fid].length; i++) {
            bytes32 quizId = userQuizIds[fid][i];
            if (userQuizAttempts[fid][quizId].state == QuizState.Completed) {
                totalScore += userQuizAttempts[fid][quizId].score;
            }
        }

        if (totalPossibleScore == 0) {
            return 0;
        } else {
            return (totalScore * 100) / totalPossibleScore;
        }
    }






    /**
     * @dev Allows a user to claim their reward for completing a quiz.
     * @param fid Identifier of the user.
     * @param quizId Identifier of the quiz.
     * @param recipient Address of the reward recipient.
     */
    function claimReward(uint256 fid, bytes32 quizId, address recipient) external {
        require(userQuizAttempts[fid][quizId].eligible, "Not eligible for reward");
        require(!userQuizAttempts[fid][quizId].rewardClaimed, "Reward already claimed");

        // Check if the caller is the owner or the user associated with the fid
        require(msg.sender == owner() || msg.sender == userData[fid].userAddress, "Unauthorized claim");

        // Define the reward amount (replace this with your reward calculation logic)
        uint256 rewardAmount = _calculateReward(fid, quizId);


        // Transfer tokens to the recipient
        _transferTokens(recipient, rewardAmount);

        // Mark the reward as claimed
        userQuizAttempts[fid][quizId].rewardClaimed = true;

        emit RewardClaimed(fid, quizId, rewardAmount);
    }


    /**
     * @dev Calculates the reward amount for a user.
     * @param fid Identifier of the user.
     * @param quizId Identifier of the quiz.
     * @return The reward amount.
     */
    function _calculateReward(uint256 fid, bytes32 quizId) internal view returns (uint256) {
        // Get the quiz attempt
        QuizAttempt storage attempt = userQuizAttempts[fid][quizId];
        uint256 startTime = attempt.startTime;
        uint256 completionTime = attempt.completionTime;
        uint256 score = attempt.score;

        // Calculate the duration of the quiz attempt
        uint256 duration = completionTime - startTime;

        // Define constants for reward calculation
        uint256 maxDuration = 3600; // Maximum duration allowed (in seconds)
        uint256 maxScore = 100; // Maximum score possible
        uint256 baseReward = 10; // Base reward amount

        // Calculate the reward based on duration and score
        uint256 rewardAmount = baseReward;

        if (duration < maxDuration) {
            // If the duration is less than the maximum allowed duration, adjust the reward
            rewardAmount *= (maxDuration - duration) / maxDuration;
        }

        // Adjust reward based on score
        rewardAmount *= score / maxScore;

        // Ensure reward amount is within bounds (optional)
        rewardAmount = rewardAmount < baseReward ? baseReward : rewardAmount;

        return rewardAmount;
    }





     /**
     * @dev Transfers tokens to a specified recipient.
     * @param recipient Address of the recipient.
     * @param amount Amount of tokens to transfer.
     */
    function _transferTokens(address recipient, uint256 amount) internal {
        require(tokenAddress != address(0), "Token address not set");
        require(quizToken.balanceOf(address(this)) >= amount, "Insufficient balance");
        // Prepare the call data for the token transfer
        bytes memory data = abi.encodeWithSignature("transfer(address,uint256)", recipient, amount);

        // Make the call to the token contract
        (bool success, ) = address(quizToken).call(data);
        require(success, "Token transfer failed");
    }



    /**
     * @dev Function to retrieve user data.
     * @param fid Identifier of the user.
     * @return userAddress Address of the user.
     * @return score Score of the user.
     */
    // Function to retrieve user data for a given FID
    function getUserData(uint256 fid) external view returns (address, uint256) {
        return (userData[fid].userAddress, userData[fid].score);
    }
	


    
    /**
     * @dev Function to update user data.
     * @param fid Identifier of the user.
     * @param userAddress Address of the user.
     */
    function updateUserData(uint256 fid, address userAddress) external onlyOwner {
        // Retrieve the existing user data
        UserData storage user = userData[fid];

        // Update user data with the new address
        user.userAddress = userAddress;

        emit UserDataUpdated(fid, userAddress);
    }



	// Function to update user data
    function _updateUserData(uint256 fid, address userAddress, uint256 score) internal {
        // Update user data in the mapping
        userData[fid] = UserData(userAddress, score);
       
        emit UserDataUpdated(fid, userAddress);
    }




    function _getQuiz(bytes32 quizId) private view returns (Quiz memory) {
        return quizzes[quizId];
    }




	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}
}
