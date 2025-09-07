import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const routes = [
  { path: '/', label: 'Home' },
  { path: '/register', label: 'Register' },
  { path: '/login', label: 'Login' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/community', label: 'Community' },
  { path: '/about', label: 'About' },
  { path: '/id-card', label: 'ID Card' },
  { path: '/settings', label: 'Settings' },
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms of Service' },
];

export default function Sitemap() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle>Website Sitemap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {routes.map(r => (
                    <Link key={r.path} to={r.path} className="block p-3 rounded border hover:bg-gov-navy/5">
                      <div className="font-medium text-gov-navy">{r.label}</div>
                      <div className="text-sm text-gray-600">{r.path}</div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
