import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import PageTransition from './PageTransition';
import ScrollToTop from './ScrollToTop';
import ErrorBoundary from './ErrorBoundary';

export default function Layout() {
  const location = useLocation();
  const authPages = ['/login', '/register', '/password/reset/request', '/password/reset/confirm'];
  const isAuthPage = authPages.some(page => location.pathname.startsWith(page));
  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Navbar />}
      <ScrollToTop />
      <main className={`flex-1 ${!isAuthPage ? 'pt-14' : ''}`}>
        <ErrorBoundary key={location.pathname}>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      {!isAuthPage && !isMessagesPage && <Footer />}
    </div>
  );
}
