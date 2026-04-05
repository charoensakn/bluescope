import { Route, Routes } from 'react-router';
import { AppTheme } from './components';
import { useUIStore } from './hooks';
import { AppLayout } from './layouts';
import {
  AboutPage,
  CaseListPage,
  ClassificationPage,
  DashboardPage,
  DescriptionPage,
  DevPage,
  KnowledgePage,
  NotFoundPage,
  RefinePage,
  SettingPage,
  SuggestionPage,
} from './pages';

function App() {
  const mode = useUIStore((state) => state.mode);

  return (
    <AppTheme mode={mode === 'system' ? (window.config.getThemeMode() as string) : mode}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="cases" element={<CaseListPage />} />
          <Route path="description" element={<DescriptionPage />} />
          <Route path="refine" element={<RefinePage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="classification" element={<ClassificationPage />} />
          <Route path="suggestion" element={<SuggestionPage />} />
          <Route path="dev" element={<DevPage />} />
          <Route path="setting" element={<SettingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AppTheme>
  );
}

export default App;
