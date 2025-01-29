/**
 * layout.tsx - Defines the root layout of the Next.js application.
 *
 * This file wraps all pages of the application and applies global styles,
 * metadata, and font configurations.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/NavBar';
import UserRoleFetcher from '@/components/UserRoleFetcher';

// Configure Geist Sans and Geist Mono fonts
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/**
 * Application-wide Metadata
 * Defines the title and description for the entire app.
 */
export const metadata: Metadata = {
  title: 'CodeLab',
  description: 'Interactive coding environment for learning and experimentation.',
};

/**
 * RootLayout Component
 * Wraps all child components with a global HTML structure and applies
 * configured fonts and styles.
 *
 * Props:
 * - children: ReactNode - The content to be rendered inside the layout.
 */

export default function RootLayout({
  student,
  teacher,
  children,
}: {
  children: React.ReactNode;
  teacher: React.ReactNode;
  student: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <UserRoleFetcher student={student} teacher={teacher}>
          {children}
        </UserRoleFetcher>
      </body>
    </html>
  );
}
