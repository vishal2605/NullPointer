

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: {
  Component: any
  pageProps: { session: any }
}) {
  return (
      <Component {...pageProps} />
  )
}