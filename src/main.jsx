import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Import base styles
import './index.css'
// Import all component and page styles via main.css
import './styles/main.css'

import App from './App.jsx'
import { PostsProvider } from './context/PostsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PostsProvider>
        <App />
      </PostsProvider>
    </BrowserRouter>
  </StrictMode>,
)
