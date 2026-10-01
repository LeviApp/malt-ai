import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { Nav } from './components/Nav'
import { PatientForm } from './components/PatientForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Nav />
     <PatientForm />
    </>
  )
}

export default App
