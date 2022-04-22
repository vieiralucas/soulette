import { Keypair } from '@solana/web3.js'
import chalk from 'chalk'
import figlet from 'figlet'
import fs from 'fs'
import * as inquirer from 'inquirer'
import os from 'os'
import path from 'path'

import { getReturnAmount, totalAmtToBePaid, randomNumber } from './helper'
import { getWalletBalance, transferSOL, airDropSol } from './solana'

//Treasury
const secretKey = [
  111, 188, 76, 169, 30, 105, 254, 33, 228, 66, 56, 215, 9, 37, 51, 188, 188,
  188, 20, 224, 228, 115, 17, 163, 151, 105, 113, 251, 105, 177, 28, 157, 125,
  202, 195, 203, 253, 137, 26, 209, 7, 2, 66, 193, 76, 241, 203, 168, 213, 5,
  226, 11, 142, 44, 125, 191, 167, 172, 166, 207, 176, 137, 210, 27,
]
const treasuryWallet = Keypair.fromSecretKey(Uint8Array.from(secretKey))

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync('SOL Stake', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  )
  console.log(chalk.yellow`The max bidding amount is 2.5 SOL here`)
}

//Ask for Ratio
//Ask for Sol to be Staked
//Check the amount to be available in Wallet
//Ask Public Key
//Generate a Random Number
//Ask for the generated Number
//If true return the SOL as per ratio

const askQuestions = (balance: number) => {
  const questions: inquirer.QuestionCollection = [
    {
      name: 'SOL',
      type: 'number',
      message: `What is the amount of SOL you want to stake? (balance: ${balance})`,
    },
    {
      type: 'rawlist',
      name: 'RATIO',
      message: 'What is the ratio of your staking?',
      choices: ['1:1.25', '1:1.5', '1.75', '1:2'],
      filter: function (val) {
        const stakeFactor = val.split(':')[1]
        return stakeFactor
      },
    },
    {
      type: 'number',
      name: 'RANDOM',
      message: 'Guess a random number from 1 to 5 (both 1, 5 included)',
      when: async (val) => {
        if (totalAmtToBePaid(parseFloat(val.SOL)) > 5) {
          console.log(
            chalk.red`You have violated the max stake limit. Stake with smaller amount.`
          )
          return false
        } else {
          // console.log("In when")
          console.log(
            `You need to pay ${chalk.green`${totalAmtToBePaid(
              val.SOL
            )}`} to move forward`
          )
          if (balance < totalAmtToBePaid(val.SOL)) {
            console.log(chalk.red`You don't have enough balance in your wallet`)
            return false
          } else {
            console.log(
              chalk.green`You will get ${getReturnAmount(
                val.SOL,
                parseFloat(val.RATIO)
              )} if guessing the number correctly`
            )
            return true
          }
        }
      },
    },
  ]
  return inquirer.prompt(questions)
}

const loadUserWallet = async (): Promise<Keypair> => {
  const fromConfig = Uint8Array.from(
    JSON.parse(
      (
        await fs.promises.readFile(
          path.join(os.homedir(), '.config', 'solana', 'id.json')
        )
      ).toString()
    )
  )

  return Keypair.fromSecretKey(Uint8Array.from(fromConfig))
}

const gameExecution = async () => {
  const userWallet = await loadUserWallet()

  init()
  const generateRandomNumber = randomNumber(1, 5)

  const userBalance = await getWalletBalance(userWallet.publicKey)
  const answers = await askQuestions(userBalance)

  if (answers.RANDOM) {
    const paymentSignature = await transferSOL(
      userWallet,
      treasuryWallet,
      totalAmtToBePaid(answers.SOL)
    )
    console.log(
      `Signature of payment for playing the game`,
      chalk.green`${paymentSignature}`
    )
    if (answers.RANDOM === generateRandomNumber) {
      //AirDrop Winning Amount
      await airDropSol(
        treasuryWallet,
        getReturnAmount(answers.SOL, parseFloat(answers.RATIO))
      )
      //guess is successfull
      const prizeSignature = await transferSOL(
        treasuryWallet,
        userWallet,
        getReturnAmount(answers.SOL, parseFloat(answers.RATIO))
      )
      console.log(chalk.green`Your guess is absolutely correct`)
      console.log(
        `Here is the price signature `,
        chalk.green`${prizeSignature}`
      )
    } else {
      //better luck next time
      console.log(chalk.yellowBright`Better luck next time`)
    }
  }
}

gameExecution()
