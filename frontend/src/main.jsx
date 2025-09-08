
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

function loadGA(id) {
   if (!id) return;
   const s1 = document.createElement('script')
   s1.async = true
   s1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
   s1.onload = () => {
      window.dataLayer = window.dataLayer || []
      function gtag() { window.dataLayer.push(arguments) }
      window.gtag = gtag
      gtag('js', new Date())
      gtag('config', id)
   }
   document.head.appendChild(s1)
}

if (import.meta.env.PROD && import.meta.env.VITE_GA_ID) {
   try { loadGA(import.meta.env.VITE_GA_ID) } catch { }
}

createRoot(document.getElementById('root')).render(<App />)
