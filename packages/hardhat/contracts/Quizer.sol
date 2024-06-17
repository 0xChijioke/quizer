//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol"; // TODO: remove before deployment.

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
        uint256 score;       // User's score
        uint256 fid;         // User's unique identifier
        address verifiedAddress; // User's verified address
    }

    // Structure to represent quiz data
    struct Quiz {
        string title;        // Title of the quiz
        string description;  // Description of the quiz
        uint256 duration;    // Duration of the quiz in seconds
        address creator;    // Creator of the quiz
        string quizHash;    // IPFS hash of the quiz content
        uint256 threshold;     // Reward threshold for the quiz  
        uint256 maxRetries;  // Maximum number of retries allowed
    }

    struct QuizAttempt {
        QuizState state; // State of the quiz attempt
        uint256 score;  // Score achieved by the user
        uint256 startTime; // Time when the quiz was started
        uint256 completionTime; // Time when the quiz was completed
        uint256 retryCount;  // Number of retries
        bool eligible; // Flag indicating if the user is eligible for a reward
        bool rewardClaimed; // Flag indicating if the reward was claimed
    }

    struct LeaderboardEntry {
        address user;
        uint256 score;
    }

    // Leaderboard storage
    LeaderboardEntry[] public leaderboard;

    // Mapping to store user's position in the leaderboard
    mapping(address => uint256) public leaderboardPositions;


    
    
    // Enum to represent the state of a quiz attempt
    enum QuizState { NotStarted, InProgress, Completed }

    enum QuizStatus { Draft, InReview, Published, Archived }



    mapping(bytes4 => QuizStatus) private quizStatus;


    // Mapping to store quiz attempts for each user
    mapping(address => mapping(bytes4 => QuizAttempt)) private userQuizAttempts;





    // Mapping to store IPFS hash with its associated identifier
    mapping(bytes4 => Quiz) private quizzes;

    // Mapping to store user data with their address
    mapping(address => UserData) private userData;

    // Mapping to store quiz attempts for each user
    mapping(address => bytes4[]) private userQuizIds;

    

    
    // Event to emit when IPFS hash is stored
    event QuizCreated(bytes4 indexed quizId, address indexed creator);

    // Event to emit when a user requests to take a quiz
    event QuizStarted(address indexed userAddress, bytes4 indexed quizId, uint256 timestamp, string quizHash);


    // Event to emit when a user restarts a quiz
    event QuizRestarted(address indexed userAddress, bytes4 indexed quizId, uint256 retryCount, uint256 timestamp);

    // Event to emit when a user completes a quiz
    event QuizCompleted(address indexed userAddress, bytes4 indexed quizId, uint256 score, uint256 timestamp, bool eligible);


    // Event to emit when a user claims reward
    event RewardClaimed(address indexed userAddress, bytes4 quizId, uint256 rewardAmount);




    // Event to emit when user data is updated
    event UserDataUpdated(address indexed userAddress, address indexed verifiedAddress, uint256 indexed fid);

	// Event to emit when user score is updated
    event UserScoreUpdated(address indexed userAddress, uint256 score);





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
     * @param _title Title of the quiz.
     * @param _description Description of the quiz.
     * @param _duration Duration of the quiz.
     * @param _maxRetries Maximum retries allowed for the quiz.
     * @param _quizHash IPFS hash of the quiz content.
     * @param _threshold Reward threshold for the quiz.
     */
    function createQuiz(
        string memory _title,
        string memory _description,
        uint256 _duration,
        uint256 _maxRetries,
        string memory _quizHash, 
        uint256 _threshold) external {
        // require(_threshold > 10 && _threshold <= 100, "Invalid threshold percentage");
        console.log(_quizHash);
        // Generate bytes4 quizId of the quiz IPFS hash
        bytes4 quizId = bytes4(keccak256(abi.encodePacked(_title, _quizHash, _threshold, msg.sender, block.timestamp)));



        // Store quiz in the mapping
        quizzes[quizId] = Quiz({
        title: _title,
        description: _description,
        creator: msg.sender,
        duration: _duration,
        quizHash: _quizHash,
        threshold: _threshold,
        maxRetries: _maxRetries
    });

        // Emit event
        emit QuizCreated(quizId, msg.sender); // TODO: Add block.timestamp?

    }




    
    /**
     * @dev Function to start a quiz attempt.
     * @param _userAddress Address of the user.
     * @param _quizId Identifier of the quiz.
     */
    function startQuiz(address _userAddress, bytes4 _quizId) external {
        // Ensure the user address is not zero
        require(_userAddress != address(0), "Invalid user address");

        // Check if the user data exists; if not, create a new entry
        if (userData[_userAddress].verifiedAddress == address(0)) {
            // Create a basic user data entry with userAddress.
            // verifiedAddress can be updated later.
            _updateUserData(_userAddress, _userAddress, 0, 0); 
        }

        // Check if the user has not already started the quiz
        require(userQuizAttempts[_userAddress][_quizId].state == QuizState.NotStarted, "Quiz already in progress or completed");




        // Check if the user has not already started the quiz
        require(userQuizAttempts[_userAddress][_quizId].state == QuizState.NotStarted, "Quiz already in progress or completed");

        
        
        // Add the quizId to the user's list of attempts
        userQuizIds[_userAddress].push(_quizId);

      
        // Get the quiz struct
        Quiz memory quiz = _getQuiz(_quizId);

        // Update attempt data
        userQuizAttempts[_userAddress][_quizId] = QuizAttempt({
            state: QuizState.InProgress,
            score: 0,
            startTime: block.timestamp,
            completionTime: 0,
            retryCount: 0,
            eligible: false,
            rewardClaimed: false
        });

        emit QuizStarted(_userAddress, _quizId, block.timestamp, quiz.quizHash);
    }




    /**
     * @dev Allows a user to restart a quiz attempt.
     * @param _userAddress Identifier of the user.
     * @param _quizId Identifier of the quiz.
     */
    function restartQuiz(address _userAddress, bytes4 _quizId) external {
        QuizAttempt storage attempt = userQuizAttempts[_userAddress][_quizId];
        require(attempt.state != QuizState.NotStarted, "Quiz not started");
        
        // Check if the user has remaining retries
        require(attempt.retryCount < quizzes[_quizId].maxRetries, "Max retries reached");

        // Increment the retry count
        attempt.retryCount++;
        
        // Update attempt state to in progress
        attempt.state = QuizState.InProgress;

        emit QuizRestarted(_userAddress, _quizId, attempt.retryCount, block.timestamp);

    }



    /**
     * @dev Allows the quizzer to complete a quiz attempt.
     * @param _userAddress Identifier of the user.
     * @param _quizId Identifier of the quiz.
     * @param _score Score percentage for the user.
     */
    function completeQuiz(address _userAddress, bytes4 _quizId, uint256 _score) external {
        QuizAttempt storage attempt = userQuizAttempts[_userAddress][_quizId];
        
        // Check if the user has started the quiz
        require(attempt.state == QuizState.InProgress, "Quiz not started");

        // Get the quiz struct
        Quiz memory quiz = _getQuiz(_quizId);

        // Adjust the score based on retries (4% for each retry)
        uint256 adjustedScore = _score > (4 * attempt.retryCount) ? _score - (4 * attempt.retryCount) : 0;

        // Apply time penalty if the quiz duration exceeded
        if (block.timestamp > attempt.startTime + quiz.duration) {
            uint256 extraTime = block.timestamp - (attempt.startTime + quiz.duration);
            uint256 penalty = extraTime / 60; // 1% per extra minute
            adjustedScore = adjustedScore > penalty ? adjustedScore - penalty : 0;
        }

        // Update the attempt data
        attempt.state = QuizState.Completed;
        attempt.score = adjustedScore;
        attempt.completionTime = block.timestamp;
        attempt.eligible = adjustedScore >= quiz.threshold;

        // Update user data and leaderboard
        _updateUserScoreAndLeaderboard(_userAddress);

        // Emit QuizCompleted event
        emit QuizCompleted(_userAddress, _quizId, adjustedScore, block.timestamp, attempt.eligible);
    }



    function _updateUserScoreAndLeaderboard(address _userAddress) internal {
        uint256 cumulativeScore = _calculateCumulativeScore(_userAddress);
        userData[_userAddress].score = cumulativeScore;
        _updateLeaderboard(_userAddress, cumulativeScore);
    }




    /**
     * @dev Calculates the cumulative score of a user.
     * @param _userAddress Address of the user.
     * @return The cumulative score.
     */
    function _calculateCumulativeScore(address _userAddress) internal view returns (uint256) {
        uint256 totalScore = 0;
        uint256 totalPossibleScore = 0;

        for (uint256 i = 0; i < userQuizIds[_userAddress].length; i++) {
            bytes4 quizId = userQuizIds[_userAddress][i];
            QuizAttempt storage attempt = userQuizAttempts[_userAddress][quizId];
            if (attempt.state == QuizState.Completed) {
                totalScore += attempt.score;
                totalPossibleScore += 100; // Each quiz has a max score of 100
            }
        }

        return totalPossibleScore > 0 ? (totalScore * 100) / totalPossibleScore : 0;
    }



    function _updateLeaderboard(address _userAddress, uint256 _score) internal {
        uint256 position = leaderboardPositions[_userAddress];

        if (position == 0) {
            // New user, add to the leaderboard
            leaderboard.push(LeaderboardEntry({user: _userAddress, score: _score}));
            leaderboardPositions[_userAddress] = leaderboard.length;
        } else {
            // Update existing user score
            leaderboard[position - 1].score = _score;
        }

        // Sort the leaderboard
        _sortLeaderboard();
    }

    function _sortLeaderboard() internal {
        for (uint256 i = 0; i < leaderboard.length - 1; i++) {
            for (uint256 j = i + 1; j < leaderboard.length; j++) {
                if (leaderboard[i].score < leaderboard[j].score) {
                    // Swap entries
                    LeaderboardEntry memory temp = leaderboard[i];
                    leaderboard[i] = leaderboard[j];
                    leaderboard[j] = temp;
                    
                    // Update positions
                    leaderboardPositions[leaderboard[i].user] = i + 1;
                    leaderboardPositions[leaderboard[j].user] = j + 1;
                }
            }
        }
    }




    /**
     * @dev Allows a user to claim their reward for completing a quiz.
     * @param _userAddress Identifier of the user.
     * @param quizId Identifier of the quiz.
     * @param recipient Address of the reward recipient.
     */
    function claimReward(address _userAddress, bytes4 quizId, address recipient) external {
        require(userQuizAttempts[_userAddress][quizId].eligible, "Not eligible for reward");
        require(!userQuizAttempts[_userAddress][quizId].rewardClaimed, "Reward already claimed");

        // Check if the caller is the owner or the user associated with the _userAddress
        require(msg.sender == owner() || msg.sender == userData[_userAddress].verifiedAddress, "Unauthorized claim");

        // Define the reward amount (replace this with your reward calculation logic)
        uint256 rewardAmount = _calculateReward(_userAddress, quizId);


        // Transfer tokens to the recipient
        _transferTokens(recipient, rewardAmount);

        // Mark the reward as claimed
        userQuizAttempts[_userAddress][quizId].rewardClaimed = true;

        emit RewardClaimed(_userAddress, quizId, rewardAmount);
    }


    /**
     * @dev Calculates the reward amount for a user.
     * @param _userAddress Identifier of the user.
     * @param quizId Identifier of the quiz.
     * @return The reward amount.
     */
    function _calculateReward(address _userAddress, bytes4 quizId) internal view returns (uint256) {
        // Get the quiz attempt
        QuizAttempt storage attempt = userQuizAttempts[_userAddress][quizId];
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
     * @param _userAddress Identifier of the user.
     * @return verifiedAddress Address of the user.
     * @return score Score of the user.
     */
    // Function to retrieve user data for a given _userAddress
    function getUserData(address _userAddress) external view returns (address, uint256) {
        return (userData[_userAddress].verifiedAddress, userData[_userAddress].score);
    }
	

    /**
     * @dev Internal function to update the user's score.
     * @param _userAddress Address of the user.
     * @param _score New score to be updated.
     */
    function _updateUserScore(address _userAddress, uint256 _score) internal {
        // Retrieve the existing user data
        UserData storage user = userData[_userAddress];

        // Update the user's score
        user.score = _score;

        // Emit an event to indicate the score update
        emit UserScoreUpdated(_userAddress, _score);
    }

   
    /**
     * @dev Internal function to update the user's verified address.
     * @param _userAddress Address of the user.
     * @param _newVerifiedAddress New verified address to be updated.
     */
    function _updateUserVerifiedAddress(address _userAddress, address _newVerifiedAddress) internal {
        require(_newVerifiedAddress != address(0), "Invalid address");

        // Retrieve the existing user data
        UserData storage user = userData[_userAddress];

        // Ensure the caller is the owner or the user themselves
        require(msg.sender == owner() || msg.sender == user.verifiedAddress, "Unauthorized");

        // Update the user's verified address
        user.verifiedAddress = _newVerifiedAddress;

        // Emit an event to indicate the verified address update
        emit UserDataUpdated(_userAddress, _newVerifiedAddress, user.fid);
    }

     /**
     * @dev Internal function to update the user's fid.
     * @param _userAddress Address of the user.
     * @param _fid New fid to be updated.
     */
    function _updateUserFid(address _userAddress, uint256 _fid) internal {
        // Retrieve the existing user data
        UserData storage user = userData[_userAddress];

        // Update the user's fid
        user.fid = _fid;

        // Emit an event to indicate the fid update
        emit UserDataUpdated(_userAddress, user.verifiedAddress, _fid);
    }




    /**
    * @dev Internal function to update user data.
    * @param _userAddress Address of the user.
    * @param _verifiedAddress Verified address of the user.
    * @param _fid User's unique identifier.
    * @param _score User's score.
    */
    function _updateUserData(address _userAddress, address _verifiedAddress, uint256 _fid, uint256 _score) internal {
        userData[_userAddress] = UserData({
            score: _score,
            fid: _fid,
            verifiedAddress: _verifiedAddress
        });
        emit UserDataUpdated(_userAddress, _verifiedAddress, _fid);
    }




    function _getQuiz(bytes4 quizId) private view returns (Quiz memory) {
        return quizzes[quizId];
    }





    function publishQuiz(bytes4 quizId) external onlyOwner {
        quizStatus[quizId] = QuizStatus.Published;
    }



    function archiveQuiz(bytes4 quizId) external onlyOwner {
        quizStatus[quizId] = QuizStatus.Archived;
    }


	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}
}
