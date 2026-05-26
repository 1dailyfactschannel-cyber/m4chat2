import { AuthProvider, useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { I18nProvider } from './lib/i18n';
import LoginScreen from './components/LoginScreen';
import DesktopMain from './components/mockups/telegram/DesktopMain';

function AppContent() {
  const { user, loading } = useAuth();
  useSettings(); // Load and sync settings on app start

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
    <I18nProvider defaultLocale="ru">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
