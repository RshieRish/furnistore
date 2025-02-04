import "./globals.css"
import { Inter } from "next/font/google"
import RootLayoutClient from "@/components/RootLayoutClient"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Furniture Store",
  description: "Your one-stop shop for modern furniture",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  )
}

