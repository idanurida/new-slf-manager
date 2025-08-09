// src/pages/dashboard/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const DashboardRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Untuk testing frontend tanpa API nyata, gunakan mock role
    const mockRedirect = () => {
      // Mock role untuk testing - bisa diubah sesuai kebutuhan
      const mockRole = 'project_lead'; // atau 'admin_lead', 'superadmin', dll
      
      switch (mockRole) {
        case 'superadmin':
          router.push('/dashboard/superadmin');
          break;
        case 'head_consultant':
          router.push('/dashboard/head-consultant');
          break;
        case 'project_lead':
          router.push('/dashboard/project-lead');
          break;
        case 'admin_lead':
          router.push('/dashboard/admin-lead');
          break;
        case 'inspector':
          router.push('/dashboard/inspector');
          break;
        case 'drafter':
          router.push('/dashboard/drafter');
          break;
        case 'client':
          router.push('/dashboard/client');
          break;
        default:
          router.push('/dashboard/project-lead'); // default mock dashboard
      }
    };

    // Simulasi delay kecil untuk efek redirect
    const timer = setTimeout(() => {
      mockRedirect();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting to mock dashboard...</p>
    </div>
  );
};

export default DashboardRedirect;

// Untuk testing frontend, tidak perlu getStaticProps karena redirect dilakukan client-side
// Halaman ini bergantung pada client-side logic dan tidak cocok untuk static generation