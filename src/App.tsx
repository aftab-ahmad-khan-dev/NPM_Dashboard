import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Overview } from './pages/Overview'
import { Packages } from './pages/Packages'
import { PackageDetail } from './pages/PackageDetail'
import { About } from './pages/About'
import { Products } from './pages/Products'
import { Pricing } from './pages/Pricing'
import { PackagesProvider } from './context/PackagesContext'
import { SplashGate } from './components/SplashGate'

export default function App() {
  return (
    <PackagesProvider>
      <SplashGate>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="packages" element={<Packages />} />
            <Route path="packages/:name" element={<PackageDetail />} />
            <Route path="products" element={<Products />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SplashGate>
    </PackagesProvider>
  )
}
