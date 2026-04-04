import { createConsumer } from '@rails/actioncable'

// Use an absolute WebSocket URL when building for Capacitor (no dev-server proxy).
const cableUrl = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws')}/cable`
  : '/cable'

const cable = createConsumer(cableUrl)
export default cable
