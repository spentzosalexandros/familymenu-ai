import { MotionConfig } from 'motion/react'
import { useEffect } from 'react'
import { DeviceProvider } from './device'
import { preloadFeatures } from './registry'
import { Stage } from './Stage'
import { useApplyTheme } from './theme'

export default function App() {
  useApplyTheme()
  useEffect(() => {
    const id = window.setTimeout(preloadFeatures, 400)
    return () => window.clearTimeout(id)
  }, [])
  return (
    <MotionConfig reducedMotion="user">
      <DeviceProvider>
        <Stage />
      </DeviceProvider>
    </MotionConfig>
  )
}
