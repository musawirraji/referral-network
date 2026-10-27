import './globals.css';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import AuthBootstrap from '@/components/AuthBootstrap';

export const metadata = {
  title: 'Referral Network',
  description: 'Refer great candidates to open roles and track their progress.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <AuthBootstrap />
        <Header />
        <main id="main" className="container">{children}</main>
        <Toast />
      </body>
    </html>
  );
}
