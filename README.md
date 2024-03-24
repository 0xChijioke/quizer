# Quizer 🏆

🚀 Welcome to Quizer: Where Learning Meets Rewards!

Quizer is not just a quiz-making tool; it's revolutionlizes way quizzes are created and shared. While still a work in progress, 

Quizer showcases remarkable potential, blending simplicity with cutting-edge technology to deliver an unparalleled user experience on-chain!



## Tech Stack 🛠️

Quizer is built with the following technologies:

- [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2) - Open source forkable Ethereum dev stack.
- [Frog](https://frog.fm/) - Minimal & lightweight framework for Farcaster Frames.
- [Open frame standard](https://github.com/open-frames/standard) - Open Frames is an interoperable standard extending the original Frames specification to support a broader range of applications and protocols.
- [Privy](https://github.com/Uniswap/v3-sdk) - Simple APIs to manage user data.
- [Pinata](https://github.com/balancer/balancer-sdk) - Pinata makes it simple to store and retrieve media on IPFS and build social applications with Farcaster.

Key Features
User-Friendly Quiz Creation

📝 Users input quiz questions effortlessly through the intuitive frontend interface, making quiz creation a breeze.
Secure Encryption


🔒 Quizer employs symmetric-key encryption to safeguard quiz content, ensuring utmost privacy and security for users.
Decentralized Storage on IPFS


🌐 Encrypted quiz content is securely stored on IPFS, leveraging its decentralized architecture to provide resilience and accessibility.
Interactive Presentation


🎉 With the decrypted quiz content in hand, the contract owner can dynamically present quizzes to users via the frontend interface, enhancing engagement and interactivity.




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
cd scaffold-eth-2
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

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`
- Edit your frontend in `packages/nextjs/pages`
- Edit your deployment scripts in `packages/hardhat/deploy`


`

## Usage 💡 

  To use Quizer:

    Create a Quiz:
        Input your quiz questions and options.
        Click "Submit" to save your quiz.
        Copy link and cast on any farcaster client.

    Take a Quiz:
        Start a quiz in a frame.
        Answer the questions by selecting the correct option.
        Submit your answers to see if you are eligible for rewards.



## Future Plans 🔭


Enhanced User Profiles: Implement user profiles to track quiz history and performance.

Leaderboards: Introduce leaderboards to showcase top performers.

Social Sharing: Allow users to share their quiz results on social media platforms.


## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing

We welcome contributions!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing.


<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>