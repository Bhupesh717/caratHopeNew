import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FloatingWhatsAppButton } from '@/components/bespoke/FloatingWhatsAppButton'
import { ApiTester } from '@/components/ApiTester'
import { MainLayoutWrapper } from '@/components/main-layout-wrapper'

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <ApiTester />
      <Navbar />
      <MainLayoutWrapper>
        {children}
      </MainLayoutWrapper>
      <FloatingWhatsAppButton phoneNumber="919876543210" />
      <Footer />
    </>
  )
}
