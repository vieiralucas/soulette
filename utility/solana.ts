import * as web3 from '@solana/web3.js'

// Treasury
const secretKey = [
  111, 188, 76, 169, 30, 105, 254, 33, 228, 66, 56, 215, 9, 37, 51, 188, 188,
  188, 20, 224, 228, 115, 17, 163, 151, 105, 113, 251, 105, 177, 28, 157, 125,
  202, 195, 203, 253, 137, 26, 209, 7, 2, 66, 193, 76, 241, 203, 168, 213, 5,
  226, 11, 142, 44, 125, 191, 167, 172, 166, 207, 176, 137, 210, 27,
]
export const treasuryWallet = web3.Keypair.fromSecretKey(
  Uint8Array.from(secretKey)
)

export const connection = new web3.Connection(
  web3.clusterApiUrl('devnet'),
  'confirmed'
)

export const transferSOL = async (
  from: web3.Keypair,
  to: web3.PublicKey,
  transferAmt: number
) => {
  try {
    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: transferAmt * web3.LAMPORTS_PER_SOL,
      })
    )
    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [from]
    )
    return signature
  } catch (err) {
    console.log(err)
    throw err
  }
}
