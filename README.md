# Quizer

🚀 Welcome to Quizer: Where Learning Meets Rewards!




Create a quiz:
![image](https://github.com/0xChijioke/quizer/assets/53488449/e81129c3-d483-40e6-ab4d-7ca5d0e624d4)




Copy and  share on a farcaster client:
![image](https://github.com/0xChijioke/quizer/assets/53488449/5172428a-385d-4af7-9c78-98872522aefe)



Take a quiz:
![image](https://github.com/0xChijioke/quizer/assets/53488449/edd13e79-8cf7-49d6-a223-ae7dd8d7c781)


TODO: Send tokens to quizzer if they are eligible.
```
function claimReward(uint256 fid, bytes32 quizId, address recipient) external
```


If quiz creation fails or a quiz is cast with an arbitrary hash the frame defaults to a hardcoded hash in the env variables.


## Tech Stack 🛠️

Quizer is built with the following technologies:

- [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2) - Open source forkable Ethereum dev stack.
- [Frog](https://frog.fm/) - Minimal & lightweight framework for Farcaster Frames.
- [Open frame standard](https://github.com/open-frames/standard) - Open Frames is an interoperable standard extending the original Frames specification to support a broader range of applications and protocols.
- [Pinata](https://github.com/balancer/balancer-sdk) - Pinata makes it simple to store and retrieve media on IPFS and build social applications with Farcaster.



## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Quizer, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/0xChijioke/quizer.git
cd quizer
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

