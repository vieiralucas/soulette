// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as web3 from '@solana/web3.js'
import * as t from 'io-ts'
import type { NextApiRequest, NextApiResponse } from 'next'

import { transferSOL, treasuryWallet } from '../../utility/solana'

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

type Data = {
  status: 'win' | 'loss' | 'invalid-payload'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // TODO: verify signature

  const payload = t
    .interface({
      amount: t.number,
      ratio: t.number,
      guess: t.number,
      signature: t.string,
      publicKey: t.string,
    })
    .decode(req.body)
  if (payload._tag === 'Left') {
    console.error(JSON.stringify(payload.left, null, 2))
    res.status(400).json({
      status: 'invalid-payload',
    })
    return
  }

  const drawnNumber = randomNumber(1, 5)
  console.log(
    JSON.stringify(
      {
        payload: payload.right,
        drawnNumber,
      },
      null,
      2
    )
  )

  if (drawnNumber === payload.right.guess) {
    await transferSOL(
      treasuryWallet(),
      new web3.PublicKey(payload.right.publicKey),
      payload.right.amount * payload.right.ratio
    )
    res.json({ status: 'win' })
    return
  }

  res.json({ status: 'loss' })
}
