Network Used: Ethereum Sepolia Testnet

Live UI URL: https://iitb-blockchain-dex-ui-yz49.vercel.app/

Contract deployment and verification:

Token A- 0x318a962eeb297e31978f6d756403a587a7a59ce5
https://sepolia.etherscan.io/address/0x318a962eeb297e31978f6d756403a587a7a59ce5#code

Token B -0xb0a9b6dbad0ee8b435c5d3c0e259dd6fe893d9eb
https://sepolia.etherscan.io/address/0xb0a9b6dbad0ee8b435c5d3c0e259dd6fe893d9eb#code

LP Token - 0xdacbfa71fd6a19d88074e8d40a5ee263dfd06003
https://sepolia.etherscan.io/address/0xdacbfa71fd6a19d88074e8d40a5ee263dfd06003

DEX 1 - 0x2f41cCE0366F2B61404Fa30398c256d0FB9e926c
https://sepolia.etherscan.io/address/0x9A161E32730da626889Acc70231F8244814f4fC8#code

DEX 2 - 0x9A161E32730da626889Acc70231F8244814f4fC8
https://sepolia.etherscan.io/address/0x9A161E32730da626889Acc70231F8244814f4fC8#code

Arbitrage Contract - 0xf01d35e7914342bC7807f1E05b8476A07e40Ec00
https://sepolia.etherscan.io/address/0xf01d35e7914342bC7807f1E05b8476A07e40Ec00#code

Transaction hashes:

Liquidity addition and LP token minting - 0xf8d1cb01d41fbe65a8f2ccb4dda9a4c0b8a07e4608d3120a1e84680d52399885

Liquidity removal and LP token burning - 0x1248a46a83f09053b059debc873fd789ff1c1717a914c97318fed8dfbfd33e1e

Swap from TokenA to TokenB - 0x02a8ead18fa8d407fb3b67a66d1662a5e0aac2b6be42e54a3a2d74e62fecf7c9

Swap from TokenB to TokenA - 0x38944ea8fc19972c1ff04d928f026e8f59beca4841fbb71b7451a723ca696da4

approve tkna for dex 2 - 0x7ed945c55b1b63f4a2f7ecddc88e7ef1901f6043157abe5686d746c1f5d662b4

add liquidity dex 2 - 0x720f1a3690c1f19c5430107820b3fb290b72d403d4ee6e63fe7ef574d856345eR

Failed arbitrage execution - 0x396fd51e521493b4b2004af720371de66ac1f311e5114acad363a039b3bc9037

Profitable arbitrage execution - 0x209dda19ca5ea5fb29370874e256de7bfcb279cfb8335d3bb91522d667ca0bbe

User Guide: How to Interact with the DEX
1. Accessing the UI
	1. Navigate to the (https://iitb-blockchain-dex-ui-yz49.vercel.app/).
	2. Ensure your MetaMask is set to the **Sepolia Testnet**.
	3. Click **"Connect Wallet"** at the top right.
2. Obtaining Tokens
	1. Go to the **Token A** and **Token B** contract links in the table above.
	2. Under the **"Write Contract"** tab, connect your Web3 wallet.
	3. Use the `mint` function to request test tokens to your address.
3. Adding Liquidity
	1. On the DEX UI, navigate to the **"Pool"** or **"Liquidity"** tab.
	2. Enter the amount for Token A and Token B. Note: The UI will automatically enforce the required $\frac{x}{y}$ ratio.
	3. Click **"Approve"** for both tokens, then click **"Add Liquidity"**.
	4. Your wallet will receive **LPT (LP Tokens)** automatically.
4. Performing Swaps
	1. Navigate to the **"Swap"** tab.
	2. Select your input token and amount.
	3. The UI will display the expected output based on the x . y = k formula (minus the 0.3% fee).
	4. Click **"Swap"** and confirm the transaction in MetaMask.
