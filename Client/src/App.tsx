import './index.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Game from './pages/game'
import Home from './pages/HomePage'
import CreatePlayer from './pages/create-player'
import Multiplayer from './pages/multiplayer'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/create-player' element={<CreatePlayer/>}/>
          <Route path='/game' element={<Game/>}/>
          <Route path='/multiplayer' element={<Multiplayer/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
