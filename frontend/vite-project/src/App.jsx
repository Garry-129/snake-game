import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Home from './Components/Home/Home'
import MediumHome from './Components/Home/MediumHome'
import HardHome from './Components/Home/HardHome'
import ImpossibleHome from './Components/Home/ImpossibleHome'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>

      {/* Navbar always visible */}
      <div className="h-screen overflow-hidden flex flex-col bg-slate-900">
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/medium" element={<MediumHome />} />
            <Route path="/hard" element={<HardHome />} />
            <Route path="/impossible" element={<ImpossibleHome />} />
          </Routes>
        </div>
      </div>

    </BrowserRouter>
  )
}
