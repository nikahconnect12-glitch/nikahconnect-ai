export const metadata = {
  title: 'Nikah Connect - AI Matching Engine',
  description: 'AI Powered Matrimonial Matching System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#f8fafc' }}>
        {children}
      </body>
    </html>
  );
}
