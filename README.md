# Ethereum Explorer (WIP)

Web3 dapp: https://bokkypoobah.github.io/Explorer/ connected to Ethereum Mainnet (WIP)

<br />

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

Select the ERC-20 TURBO token at `0xA35923162C49cF95e6BF26623385eb431ad920D3`

<kbd><img src="images/SampleScreen16.png" width="800" /></kbd>

Click on the [Sync Token Events] button

<kbd><img src="images/SampleScreen17.png" width="800" /></kbd>

1,307,482 event logs retrieved from the web3 connection and stored in the local IndexedDB database in ~ 10 minutes. Only works on Ethereum Mainnet as L2s may have a small `provider.getLogs(...)` block range.

<kbd><img src="images/SampleScreen18.png" width="800" /></kbd>

<br />

---

### Deployed Contracts For Testing

* Mar 25 2025 - Deployed [deployed_contracts/TestExplorer_v0.8.0a_Sepolia_0xFD8609Efb8A768A8ef559Cba94Ec21E7Bf8801c4.sol](deployed_contracts/TestExplorer_v0.8.0a_Sepolia_0xFD8609Efb8A768A8ef559Cba94Ec21E7Bf8801c4.sol) to Sepolia [0xfd8609efb8a768a8ef559cba94ec21e7bf8801c4](https://sepolia.etherscan.io/address/0xfd8609efb8a768a8ef559cba94ec21e7bf8801c4#code)
* Mar 30 2025 - Deployed [deployed_contracts/TestExplorer_v0.8.0b_Sepolia_0xd873a572631cD837B03218369974C26b7A82f245.sol](deployed_contracts/TestExplorer_v0.8.0b_Sepolia_0xd873a572631cD837B03218369974C26b7A82f245.sol) to Sepolia [0xd873a572631cD837B03218369974C26b7A82f245](https://sepolia.etherscan.io/address/0xd873a572631cD837B03218369974C26b7A82f245#code)

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2025. The MIT License
