"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { DEX_ADDRESS, DEX2_ADDRESS, DEX_ABI, TOKEN_A_ADDRESS, TOKEN_B_ADDRESS, LP_TOKEN_ADDRESS, ERC20_ABI, ARBITRAGE_ADDRESS, ARBITRAGE_ABI } from "../config";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [reserves, setReserves] = useState({ a: "0", b: "0", price: "0" });
  const [balances, setBalances] = useState({ lp: "0", a: "0", b: "0" });
  const [status, setStatus] = useState("Connect wallet to begin.");
  
  // Inputs
  const [addA, setAddA] = useState("10");
  const [addB, setAddB] = useState("10");
  const [removeLP, setRemoveLP] = useState("1");
  const [swapAmt, setSwapAmt] = useState("1");

  const [arbAmt, setArbAmt] = useState("1");
  const [arbMinProfit, setArbMinProfit] = useState("0.01");

  const updateData = async (userAddress: string) => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, provider);
    const lpContract = new ethers.Contract(LP_TOKEN_ADDRESS, ERC20_ABI, provider);
    
    try {
      // 1. View Pool Reserves & Spot Price
      const [resA, resB] = await dex.getReserves();
      const a = ethers.formatEther(resA);
      const b = ethers.formatEther(resB);
      const price = Number(a) > 0 ? (Number(b) / Number(a)).toFixed(4) : "0";
      setReserves({ a, b, price });

      // 2. Observe LP Minting/Burning (User Balances)
      const lpBal = await lpContract.balanceOf(userAddress);
      setBalances({ 
        lp: ethers.formatEther(lpBal), 
        a: "...", // You can add Token A/B balance checks here if desired
        b: "..."  
      });
      
      setStatus("Data synced with blockchain.");
    } catch (e: any) { console.error(e); }
  };

  const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);
    updateData(address);
  };
  
  // ONE-TIME APPROVAL FUNCTION
  const handleApprove = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Connect to Token A and Token B directly
      const tokenA = new ethers.Contract(TOKEN_A_ADDRESS, ERC20_ABI, signer);
      const tokenB = new ethers.Contract(TOKEN_B_ADDRESS, ERC20_ABI, signer);

      setStatus("Approving Token A... please confirm in MetaMask.");
      // ethers.MaxUint256 is the standard way to say "approve infinite tokens"
      let tx1 = await tokenA.approve(DEX_ADDRESS, ethers.MaxUint256);
      await tx1.wait();

      setStatus("Approving Token B... please confirm in MetaMask.");
      let tx2 = await tokenB.approve(DEX_ADDRESS, ethers.MaxUint256);
      await tx2.wait();

      setStatus("Tokens Approved! You can now click Add Liquidity.");
    } catch (e: any) { 
      setStatus("Approval Error: " + (e.reason || e.message)); 
    }
  };

  // Add Liquidity
  const handleAdd = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, signer);
      
      setStatus("Adding Liquidity... Approve in MetaMask.");
      const tx = await dex.addLiquidity(ethers.parseEther(addA), ethers.parseEther(addB));
      await tx.wait();
      
      setStatus("Liquidity Added! LP Tokens Minted.");
      if (account) updateData(account);
    } catch (e: any) { setStatus("Error: " + (e.reason || e.message)); }
  };

  // Remove Liquidity
  const handleRemove = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, signer);
      
      setStatus("Removing Liquidity... Approve in MetaMask.");
      const tx = await dex.removeLiquidity(ethers.parseEther(removeLP));
      await tx.wait();
      
      setStatus("Liquidity Removed! LP Tokens Burned.");
      if (account) updateData(account);
    } catch (e: any) { setStatus("Error: " + (e.reason || e.message)); }
  };

  // Perform Token Swap (A for B)
  const handleSwap = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, signer);
      
      setStatus("Swapping Token A for B... Approve in MetaMask.");
      const tx = await dex.swapAforB(ethers.parseEther(swapAmt));
      await tx.wait();
      
      setStatus("Swap Complete!");
      if (account) updateData(account);
    } catch (e: any) { setStatus("Error: " + (e.reason || e.message)); }
  };

  const handleArbitrage = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const arbContract = new ethers.Contract(ARBITRAGE_ADDRESS, ARBITRAGE_ABI, signer);
      
      setStatus(`Attempting Arbitrage (Min Profit: ${arbMinProfit})...`);
      
      // We pass the amount to trade, and the minimum profit required to NOT revert
      const tx = await arbContract.executeAtoBtoA(
        DEX_ADDRESS,
        DEX2_ADDRESS,
        ethers.parseEther(arbAmt),
        ethers.parseEther(arbMinProfit)
      );
      await tx.wait();
      
      setStatus("Arbitrage Successful! Profit captured.");
      if (account) updateData(account);
    } catch (e: any) { 
      // This is expected to trigger when the profit threshold isn't met!
      setStatus("Arbitrage Reverted (Failed): " + (e.reason || e.message)); 
    }
  };

  return (
    <main style={{ padding: '30px', fontFamily: 'monospace', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>IIT Bombay DEX Portal</h1>
      
      {!account ? (
        <button onClick={connectWallet} style={{ width: '100%', padding: '15px' }}>Connect Wallet</button>
      ) : (
        <>
          {/* STATS PANEL */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <div style={{ flex: 1, border: '1px solid black', padding: '15px' }}>
              <h3>Pool Reserves</h3>
              <p>Token A: {reserves.a}</p>
              <p>Token B: {reserves.b}</p>
              <p><strong>Spot Price: 1 A = {reserves.price} B</strong></p>
            </div>
            <div style={{ flex: 1, border: '1px solid blue', padding: '15px', backgroundColor: '#eef' }}>
              <h3>Your Wallet</h3>
              <p>Address: {account.substring(0,6)}...{account.substring(38)}</p>
              <p><strong>LP Tokens: {balances.lp}</strong></p>
            </div>
          </div>

          <p style={{ padding: '10px', background: '#ddd', marginTop: '20px' }}><strong>Status:</strong> {status}</p>

          {/* ADD LIQUIDITY */}
          <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px' }}>
            <h3>1. Add Liquidity</h3>
			<button onClick={handleApprove} style={{ marginBottom: '15px', background: '#ffeeba', padding: '10px' }}>
              ⚠ Step 1: Approve Tokens (Do this first!)
            </button>
            <br/>
            <input value={addA} onChange={e => setAddA(e.target.value)} placeholder="Token A Amount" style={{ marginRight: '10px', width: '100px' }} />
            <input value={addB} onChange={e => setAddB(e.target.value)} placeholder="Token B Amount" style={{ marginRight: '10px', width: '100px' }} />
            <button onClick={handleAdd}>Add & Mint LP</button>
          </div>

          {/* REMOVE LIQUIDITY */}
          <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '10px' }}>
            <h3>2. Remove Liquidity</h3>
            <input value={removeLP} onChange={e => setRemoveLP(e.target.value)} placeholder="LP to Burn" style={{ marginRight: '10px', width: '100px' }} />
            <button onClick={handleRemove}>Burn LP & Remove</button>
          </div>

          {/* SWAP */}
          <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '10px' }}>
            <h3>3. Swap Tokens</h3>
            <input value={swapAmt} onChange={e => setSwapAmt(e.target.value)} placeholder="Token A to Swap" style={{ marginRight: '10px', width: '100px' }} />
            <button onClick={handleSwap}>Swap A for B</button>
          </div>

          {/* NEW: ARBITRAGE SECTION */}
          <div style={{ border: '2px solid #ff4d4f', padding: '15px', marginTop: '20px', backgroundColor: '#fff1f0' }}>
            <h3 style={{ color: '#cf1322' }}>4. Arbitrage Execution Bot</h3>
            <p style={{ fontSize: '12px', marginBottom: '10px' }}>
              Executes a circular trade (A → B → A). Reverts if profit is less than the minimum threshold.
            </p>
            <input 
              value={arbAmt} 
              onChange={e => setArbAmt(e.target.value)} 
              placeholder="Trade Amount (Token A)" 
              style={{ marginRight: '10px', width: '150px' }} 
            />
            <input 
              value={arbMinProfit} 
              onChange={e => setArbMinProfit(e.target.value)} 
              placeholder="Min Profit Threshold" 
              style={{ marginRight: '10px', width: '150px' }} 
            />
            <button 
              onClick={handleArbitrage} 
              style={{ background: '#cf1322', color: 'white', fontWeight: 'bold' }}
            >
              Execute Arbitrage
            </button>
          </div>
        </>
      )}
    </main>
  );
}