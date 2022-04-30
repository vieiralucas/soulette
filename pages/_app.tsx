import { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import * as web3 from '@solana/web3.js'
import type { AppProps } from 'next/app'
import React from 'react'

import lightTheme from '../styles/theme/lightTheme'
import createEmotionCache from '../utility/createEmotionCache'

const clientSideEmotionCache = createEmotionCache()

const MyApp = (props: AppProps<{ emotionCache?: EmotionCache }>) => {
  const { Component, pageProps } = props
  const { emotionCache = clientSideEmotionCache } = pageProps
  const endpoint = web3.clusterApiUrl('devnet')
  const wallet = new PhantomWalletAdapter()

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[wallet]}>
        <WalletModalProvider>
          <CacheProvider value={emotionCache}>
            <ThemeProvider theme={lightTheme}>
              <CssBaseline />
              <Component {...pageProps} />
            </ThemeProvider>
          </CacheProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default MyApp
