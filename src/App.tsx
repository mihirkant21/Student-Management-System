import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Departments from './pages/Departments';
import Marks from './pages/Marks';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Events from './pages/Events';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <Students />;
      case 'departments':
        return <Departments />;
      case 'marks':
        return <Marks />;
      case 'attendance':
        return <Attendance />;
      case 'fees':
        return <Fees />;
      case 'events':
        return <Events />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
