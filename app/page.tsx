import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to login page for now - you can customize this behavior
  redirect('/login');
}