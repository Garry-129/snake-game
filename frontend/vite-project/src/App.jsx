import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Home from './Components/Home/Home'


export default function App() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-900">
      <Navbar />
      <div className="flex-1">
        <Home />
      </div>
    </div>
  )
}
