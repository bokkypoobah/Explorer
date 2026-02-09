# Ethereum Explorer (WIP)

Lightweight EVM (Ethereum Virtual Machine) chain explorer, using your web3 connection to an archive node. Uses Etherscan to detect some transactions and OpenSea to retrieve NFT metadata and events.

Web3 dapp: https://bokkypoobah.github.io/Explorer/ connected to Ethereum Mainnet (WIP)

<br />

#### Requirements

* Web3 connection to archive nodes to retrieve historical event logs, e.g., through MetaMask
* Etherscan API key to retrieve EOA to EOA, internal, and non-event-log-emitting transactions. The free plan is sufficient. See https://etherscan.io/apis
* OpenSea API key to retrieve NFT metadata and market information. See https://docs.opensea.io/reference/api-keys
* Alchemy API key to retrieve NFT metadata and market information. See https://www.alchemy.com/docs/create-an-api-key

Enter the API keys in Other -> Config -> API Keys.

---

### Sample Screens

#### Ethereum Mainnet

Get your free (or non-free) API key from https://etherscan.io/apis and enter in the Other -> Config page. This API key is used to import the ABI and source code for contracts, and later on transactions and internal transaction listings for addresses. We are not affiliated with Etherscan.

Click [IMPORT FROM ETHERSCAN] to import a list of EVM chains.

<kbd><img src="images/SampleScreen01.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen02.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen03.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen04.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen05.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen06.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen07.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen08.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen09.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen10.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen11.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen12.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen13.png" width="800" /></kbd>

#### Base Mainnet

<kbd><img src="images/SampleScreen14.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen15.png" width="800" /></kbd>

#### Ethereum Mainnet Token

Select ERC-20 WEENUS @ `0x2823589Ae095D99bD64dEeA80B4690313e2fB519`

<kbd><img src="images/SampleScreen16.png" width="800" /></kbd>

Select [Token Contract]

<kbd><img src="images/SampleScreen17.png" width="800" /></kbd>

Click on the [Sync Token Events] button - 265 events

<kbd><img src="images/SampleScreen18.png" width="800" /></kbd>

ERC-20 Owners

<kbd><img src="images/SampleScreen19.png" width="800" /></kbd>

ERC-20 Approvals

<kbd><img src="images/SampleScreen20.png" width="800" /></kbd>

ERC-20 Events

<kbd><img src="images/SampleScreen21.png" width="800" /></kbd>

ERC-721 Larva Chad @ `0x8FA600364B93C53e0c71C7A33d2adE21f4351da3` events

<kbd><img src="images/SampleScreen22.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen23.png" width="800" /></kbd>

After clicking on [Sync Token Metadata]

<kbd><img src="images/SampleScreen24.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen25.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen26.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen27.png" width="800" /></kbd>

ERC-1155 NYAN CAT @ `0xB32979486938AA9694BFC898f35DBED459F44424` events

<kbd><img src="images/SampleScreen28.png" width="800" /></kbd>

After clicking on [Sync Token Metadata]

<kbd><img src="images/SampleScreen29.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen30.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen31.png" width="800" /></kbd>

#### Punks on Ethereum Mainnet

<kbd><img src="images/SampleScreen32.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen33.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen34.png" width="800" /></kbd>

<kbd><img src="images/SampleScreen35.png" width="800" /></kbd>

#### Portfolio

Click on the [Address Book] button

<kbd><img src="images/SampleScreen36.png" width="800" /></kbd>

Click on Add

<kbd><img src="images/SampleScreen37.png" width="800" /></kbd>

Paste your address. Use the tags to group your addresses

<kbd><img src="images/SampleScreen38.png" width="800" /></kbd>

Paste your other addresses

<kbd><img src="images/SampleScreen39.png" width="800" /></kbd>

You can now select from your list of addresses or the tags from your address book. Or just paste an address not in your address book.

<kbd><img src="images/SampleScreen40.png" width="800" /></kbd>

Selecting by tags

<kbd><img src="images/SampleScreen41.png" width="800" /></kbd>

Click on the [Sync Portfolio] button

<kbd><img src="images/SampleScreen42.png" width="800" /></kbd>

Some data

<kbd><img src="images/SampleScreen43.png" width="800" /></kbd>

<br />

---

### Deployed Contracts For Testing

* Mar 25 2025 - Deployed [deployed_contracts/TestExplorer_v0.8.0a_Sepolia_0xFD8609Efb8A768A8ef559Cba94Ec21E7Bf8801c4.sol](deployed_contracts/TestExplorer_v0.8.0a_Sepolia_0xFD8609Efb8A768A8ef559Cba94Ec21E7Bf8801c4.sol) to Sepolia [0xfd8609efb8a768a8ef559cba94ec21e7bf8801c4](https://sepolia.etherscan.io/address/0xfd8609efb8a768a8ef559cba94ec21e7bf8801c4#code)
* Mar 30 2025 - Deployed [deployed_contracts/TestExplorer_v0.8.0b_Sepolia_0xd873a572631cD837B03218369974C26b7A82f245.sol](deployed_contracts/TestExplorer_v0.8.0b_Sepolia_0xd873a572631cD837B03218369974C26b7A82f245.sol) to Sepolia [0xd873a572631cD837B03218369974C26b7A82f245](https://sepolia.etherscan.io/address/0xd873a572631cD837B03218369974C26b7A82f245#code)

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2025. The MIT License
