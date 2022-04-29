import { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import type { AppProps } from 'next/app'
import React from 'react'

import '../styles/globals.css'
import lightTheme from '../styles/theme/lightTheme'
import createEmotionCache from '../utility/createEmotionCache'

const clientSideEmotionCache = createEmotionCache()

const MyApp = (props: AppProps<{ emotionCache?: EmotionCache }>) => {
  const { Component, pageProps } = props
  const { emotionCache = clientSideEmotionCache } = pageProps

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  )
}

export default MyApp
