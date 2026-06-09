import './globals.css';

export const metadata = {
  title: 'CBC Senior School Dashboard',
  description: 'Grade 10-12 competency and pathway tracking',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
