import "./globals.css";

export const metadata = {
  title: "NotesToQuiz — Turn Your Notes Into Quizzes",
  description:
    "Upload your lecture notes and get an instant AI-generated quiz that tracks your weak topics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
