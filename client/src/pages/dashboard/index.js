import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from 'services/api'; // pakai service dari api.js

const DashboardRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const redirectToRoleDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const user = await authService.getMe(); // ini akan otomatis mock kalau NEXT_PUBLIC_USE_MOCKS=true
        const { role } = user.data; // karena mockPromise return { data: user }

        // Redirect berdasarkan role
        switch (role) {
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
            router.push('/login');
        }
      } catch (err) {
        console.error('Error redirecting:', err);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    redirectToRoleDashboard();
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting to your dashboard...</p>
    </div>
  );
};

export default DashboardRedirect;
