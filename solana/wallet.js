import { Connection, clusterApiUrl, PublicKey } from "https://esm.sh/@solana/web3.js";

window.addEventListener("DOMContentLoaded", () => {
  const connectButton = document.getElementById("connectWalletBtn");
  const walletAddressText = document.getElementById("walletAddress");

  connectButton.addEventListener("click", async () => {
    try {
      const provider = window?.phantom?.solana;

      if (!provider?.isPhantom) {
        alert("Phantom Wallet not found! Please install it.");
        return;
      }

      const resp = await provider.connect();
      const publicKey = resp.publicKey.toString();

      walletAddressText.innerText = `Connected: ${publicKey}`;

      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const balance = await connection.getBalance(new PublicKey(publicKey));
      console.log("Balance in SOL:", balance / 1e9);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  });
});