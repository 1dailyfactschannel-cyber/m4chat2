import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginScreen from './components/LoginScreen';
import DesktopMain from './components/mockups/telegram/DesktopMain';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <DesktopMain />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
