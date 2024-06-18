import "./global.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>CrediPlan</title>
        <link rel="icon" href="/svg/logoapp.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
