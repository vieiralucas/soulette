import * as web3 from '@solana/web3.js'

const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");

export const getWalletBalance = async (pubk: web3.PublicKey) => {
  try {
    const balance = await connection.getBalance(pubk);
    return balance / web3.LAMPORTS_PER_SOL;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export const transferSOL = async (from: web3.Keypair, to: web3.Keypair, transferAmt: number) => {
  try {
    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to.publicKey,
        lamports: transferAmt * web3.LAMPORTS_PER_SOL
      })
    )
    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [from]
    )
    return signature;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export const airDropSol = async (wallet: web3.Keypair, transferAmt: number) => {
  try {
    const fromAirDropSignature = await connection.requestAirdrop(wallet.publicKey, transferAmt * web3.LAMPORTS_PER_SOL);
    await connection.confirmTransaction(fromAirDropSignature);
  } catch (err) {
    console.log(err);
    throw err
  }
}

