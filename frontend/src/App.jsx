/**
 * App — top-level component defining the route table.
 *
 * Public routes: home, courses, course details, login, register, forgot
 * password. Protected routes: dashboard, learning, quiz. Admin routes are
 * additionally gated by role. Page components are lazy-loaded and rendered
 * inside a Suspense boundary per the performance guidelines.
 */
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute/index.js';
import Spinner from './components/Spinner/index.js';

// Lazy-load route pages so the initial bundle stays small.
const Home = lazy(() => import('./pages/Home/Home.jsx'));
const Login = lazy(() => import('./pages/Login/Login.jsx'));
const Register = lazy(() => import('./pages/Register/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword.jsx'));
const Catalogue = lazy(() => import('./pages/Catalogue/Catalogue.jsx'));
const CourseDetails = lazy(() => import('./pages/CourseDetails/CourseDetails.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard.jsx'));
const Learning = lazy(() => import('./pages/Learning/Learning.jsx'));
const Quiz = lazy(() => import('./pages/Quiz/Quiz.jsx'));
const AdminPanel = lazy(() => import('./pages/Admin/AdminPanel.jsx'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound.jsx'));

const App = () => (
  <>
    <Navbar />
    <main className="app-main">
      <Suspense fallback={<Spinner label="Loading page…" />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/courses" element={<Catalogue />} />
          <Route path="/courses/:id" element={<CourseDetails />} />

          {/* Authenticated students */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/:courseId"
            element={
              <ProtectedRoute>
                <Learning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
  </>
);

export default App;
