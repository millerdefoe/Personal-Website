import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CareerPage } from './pages/CareerPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/projects" element={<Navigate to="/career" replace />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
