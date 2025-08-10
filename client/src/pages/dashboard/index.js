// src/pages/dashboard/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const DashboardRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Fungsi untuk mendeteksi role dari localStorage (mock)
    const detectRoleAndRedirect = () => {
      // Cek apakah kode dijalankan di browser
      if (typeof window === 'undefined') {
         console.log("Masih di server side, menunggu client...");
         return;
      }

      console.log("Mendeteksi role di client side...");
      // Coba dapatkan role yang disimpan secara eksplisit
      let mockRole = localStorage.getItem('mockUserRole');
      console.log("Role dari mockUserRole:", mockRole);

      // Jika tidak ada, coba ekstrak dari token
      if (!mockRole) {
        const token = localStorage.getItem('token');
        console.log("Token ditemukan:", token);
        if (token && token.startsWith('mock-jwt-')) {
          // Ekstrak role dari token, misal 'mock-jwt-superadmin' menjadi 'superadmin'
          mockRole = token.replace('mock-jwt-', '');
          console.log("Role diekstrak dari token:", mockRole);
        }
      }

      // Jika masih tidak ada, gunakan default
      if (!mockRole) {
         mockRole = 'project_lead'; // Default fallback
         console.log("Tidak ada role ditemukan, menggunakan default:", mockRole);
      }

      // Normalisasi role jika perlu (pastikan sesuai dengan case di switch)
      // Misalnya, jika Anda menyimpan 'superadmin' tapi switch case menunggu 'super_admin'
      // mockRole = mockRole.replace('-', '_'); 

      // Redirect berdasarkan role yang terdeteksi
      let redirectPath = '/dashboard/project-lead'; // Default
      switch (mockRole) {
        case 'superadmin':
          redirectPath = '/dashboard/superadmin';
          break;
        case 'head_consultant':
          redirectPath = '/dashboard/head-consultant';
          break;
        case 'project_lead':
          redirectPath = '/dashboard/project-lead';
          break;
        case 'admin_lead':
          redirectPath = '/dashboard/admin-lead';
          break;
        case 'inspector':
          redirectPath = '/dashboard/inspector';
          break;
        case 'drafter':
          redirectPath = '/dashboard/drafter';
          break;
        case 'client':
          redirectPath = '/dashboard/client';
          break;
        default:
          console.warn("Role tidak dikenali:", mockRole, ". Mengarahkan ke default.");
          // Biarkan redirectPath ke default
      }

      console.log(`Mengarahkan ke: ${redirectPath} untuk role: ${mockRole}`);
      router.push(redirectPath);
    };

    // Panggil fungsi deteksi
    detectRoleAndRedirect();

  }, [router]); // Ketergantungan useEffect

  // Tampilan sementara saat redirect
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Mendeteksi role dan mengarahkan ke dashboard Anda...</p>
    </div>
  );
};

export default DashboardRedirect;

// Karena logika utama di client-side, tidak perlu getStaticProps
// atau gunakan yang sangat sederhana jika diperlukan framework
export async function getStaticProps() {
  return {
    props: {} // Atau hapus fungsi ini sepenuhnya
  };
}