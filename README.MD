# Block-Explorer

A simple browser-based Ethereum explorer built with plain JavaScript. It connects directly to the Ethereum network using a public RPC endpoint and lets you view blocks, transactions, and addresses without any backend.

## Features

- View the latest blocks with number, hash, transaction count, and timestamp  
- Scan recent transactions from the last few blocks  
- Inspect block details including gas used and all transactions inside  
- Inspect transaction details such as sender, recipient, value, and status  
- Look up Ethereum addresses to see balance and transaction count  
- Search by block number, block/transaction hash, or address  
- Toggle between dark and light themes, with preference saved locally  

## How It Works

The explorer uses the Ethereum JSON-RPC API through the endpoint:

https://ethereum-rpc.publicnode.com


### Key Methods Used
- `eth_blockNumber` – latest block number  
- `eth_getBlockByNumber` / `eth_getBlockByHash` – block details  
- `eth_getTransactionByHash` – transaction details  
- `eth_getTransactionReceipt` – transaction status  
- `eth_getBalance` – account balance  
- `eth_getTransactionCount` – account transaction count  

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Chibey-max/Block-Explorer.git
   cd Block-Explorer
   ```  
 2.  Open index.html in your browser.
No build step or server is required.

## Usage
- The homepage shows the latest blocks and recent transactions

- Click a block or transaction to see details

- Use the search bar to enter a block number, hash, or address

- Toggle the theme with the button in the header
