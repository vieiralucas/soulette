import LoadingButton from '@mui/lab/LoadingButton'
import Alert, { AlertColor } from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import * as web3 from '@solana/web3.js'
import type { NextPage, GetServerSideProps } from 'next'
import React, {
  FormEventHandler,
  useState,
  useEffect,
  useCallback,
} from 'react'

import { treasuryWallet } from '../utility/solana'

interface Props {
  treasuryWallet: string
}
const Home: NextPage<Props> = (props) => {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const ratios = [1.25, 1.5, 1.75, 2]
  const guesses = [1, 2, 3, 4, 5]

  const updateBalance = useCallback(async () => {
    if (!publicKey) {
      return
    }

    const info = await connection.getAccountInfo(publicKey)
    if (!info) {
      return
    }
    setBalance(info.lamports / web3.LAMPORTS_PER_SOL)
  }, [connection, publicKey, setBalance])

  useEffect(() => {
    updateBalance()
  }, [connection, publicKey])

  const [state, setState] = useState({
    amount: '0',
    ratio: 0,
    guess: 0,
  })

  const onChangeAmount = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setState({
        ...state,
        amount: e.target.value,
      })
    },
    [state, setState]
  )

  const onChangeRatio = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
      setState({
        ...state,
        ratio: parseInt(value),
      })
    },
    [state, setState]
  )

  const onChangeGuess = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
      setState({
        ...state,
        guess: parseInt(value),
      })
    },
    [state, setState]
  )

  const onSubmit: FormEventHandler = useCallback(
    (e) => {
      e.preventDefault()
      setLoading(true)

      const amount = parseFloat(state.amount)

      if (!publicKey) {
        // TODO: report not connected to wallet error
        return
      }

      const transaction = new web3.Transaction()
      const recipientPubKey = new web3.PublicKey(props.treasuryWallet)

      const sendSolInstruction = web3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPubKey,
        lamports: web3.LAMPORTS_PER_SOL * amount,
      })
      transaction.add(sendSolInstruction)

      sendTransaction(transaction, connection)
        .then((signature) =>
          fetch('/api/soulette', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount,
              ratio: ratios[state.ratio],
              guess: guesses[state.guess],
              signature,
              publicKey,
            }),
          })
        )
        .then((res) => res.json())
        .then((response) => {
          if (response.status === 'win') {
            setSnackbar({
              open: true,
              severity: 'success',
              message: 'You win!',
            })
            return
          }

          if (response.status === 'loss') {
            setSnackbar({
              open: true,
              severity: 'error',
              message: 'You lost. Better lucky next time.',
            })
            return
          }
        })
        .then(updateBalance)
        .catch((err) => {
          console.error(err)
          setSnackbar({
            open: true,
            severity: 'error',
            message: 'Something went wrong. =[',
          })
        })
        .then(() => {
          setLoading(false)
        })
    },
    [state, updateBalance]
  )

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: 'success' as AlertColor,
    message: 'You won!',
  })

  const onCloseSnackbar = useCallback(() => {
    setSnackbar({
      ...snackbar,
      open: false,
    })
  }, [snackbar])

  return (
    <>
      <Container maxWidth="md">
        <Box mt={2} mb={2} display="flex" justifyContent="space-between">
          <Typography variant="h3" component="h1">
            Soulette
          </Typography>
          <WalletMultiButton disabled={loading} />
        </Box>

        <form onSubmit={onSubmit}>
          <TextField
            label={`What is the amount of SOL you want to stake? (balance: ${balance})`}
            fullWidth
            value={state.amount}
            onChange={onChangeAmount}
            disabled={loading}
          />
          <Box>
            <FormControl>
              <FormLabel id="ratio-label">
                What is the ratio of your staking?
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="ratio-label"
                name="ratio"
                value={state.ratio}
                onChange={onChangeRatio}
              >
                <FormControlLabel
                  value="0"
                  control={<Radio disabled={loading} />}
                  label="1:1.25"
                />
                <FormControlLabel
                  value="1"
                  control={<Radio disabled={loading} />}
                  label="1:1.5"
                />
                <FormControlLabel
                  value="2"
                  control={<Radio disabled={loading} />}
                  label="1:1.75"
                />
                <FormControlLabel
                  value="3"
                  control={<Radio disabled={loading} />}
                  label="1:2"
                />
              </RadioGroup>
            </FormControl>
          </Box>
          <Box>
            <FormControl>
              <FormLabel id="guess-label">
                Guess a random number from 1 to 5 (both 1, 5 included)
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="guess-label"
                name="guess"
                value={state.guess}
                onChange={onChangeGuess}
              >
                <FormControlLabel
                  value="0"
                  control={<Radio disabled={loading} />}
                  label="1"
                />
                <FormControlLabel
                  value="1"
                  control={<Radio disabled={loading} />}
                  label="2"
                />
                <FormControlLabel
                  value="2"
                  control={<Radio disabled={loading} />}
                  label="3"
                />
                <FormControlLabel
                  value="3"
                  control={<Radio disabled={loading} />}
                  label="4"
                />
                <FormControlLabel
                  value="4"
                  control={<Radio disabled={loading} />}
                  label="5"
                />
              </RadioGroup>
            </FormControl>
          </Box>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            disabled={loading}
          >
            Submit
          </LoadingButton>
        </form>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={onCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            onClose={onCloseSnackbar}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async () => ({
  props: {
    treasuryWallet: treasuryWallet().publicKey.toString(),
  },
})

export default Home
