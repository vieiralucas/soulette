// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as web3 from '@solana/web3.js'
import type { NextApiRequest, NextApiResponse } from 'next'

import { transferSOL, treasuryWallet } from '../../utility/solana'

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

type Data = {
  status: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // TODO: verify signature

  console.log(treasuryWallet.publicKey.toString())

  const drawnNumber = randomNumber(1, 5)
  console.log(req.body, drawnNumber)

  if (drawnNumber === req.body.guess) {
    await transferSOL(
      treasuryWallet,
      new web3.PublicKey(req.body.publicKey),
      req.body.amount * req.body.ratio
    )
    res.json({ status: 'win' })
    return
  }

  res.json({ status: 'loss' })
}
