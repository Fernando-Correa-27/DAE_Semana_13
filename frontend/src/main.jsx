import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './styles/reset.css'
import './styles/variables.css'
import './styles/base.css'
import './styles/component-overrides.css'
import './styles/exams.css'
import './components/Header/Header.css'
import './components/Footer/Footer.css'
import './components/Hero/Hero.css'
import './components/MovieCard/MovieCard.css'
import './components/MovieList/MovieList.css'
import App from './App.jsx'
import ExamsPage from './pages/ExamsPage/ExamsPage.jsx'
import ExamCreatePage from './pages/ExamCreatePage/ExamCreatePage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/exams" element={<ExamsPage />} />
        <Route path="/exams/new" element={<ExamCreatePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
