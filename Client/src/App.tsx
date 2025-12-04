import './index.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Game from './pages/game'
import Home from './pages/HomePage'
import CreatePlayer from './pages/create-player'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/create-player' element={<CreatePlayer/>}/>
          <Route path='/game' element={<Game/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
