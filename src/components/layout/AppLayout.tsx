import type React from 'react';
import Header from './Header';
// import Footer from './Footer'; // Optional: if you decide to add a footer

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default AppLayout;
