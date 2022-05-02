import * as web3 from '@solana/web3.js'

// Treasury
export const treasuryWallet = () => {
  const secretKey = JSON.parse(process.env.TREASURY_WALLET ?? '[]')
  return web3.Keypair.fromSecretKey(Uint8Array.from(secretKey))
}

const cluster: web3.Cluster = (() => {
  switch (process.env.NEXT_PUBLIC_CLUSTER) {
    case undefined:
      throw new Error('Missing CLUSTER environment variable')
    case 'testnet':
      return 'testnet'
    case 'devnet':
      return 'devnet'
    case 'mainnet-beta':
      return 'mainnet-beta'
  }

  throw new Error(
    `Provided CLUSTER=${process.env.NEXT_PUBLIC_CLUSTER} is invalid`
  )
})()

export const connection = new web3.Connection(
  web3.clusterApiUrl(cluster),
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
