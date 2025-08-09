// client/src/pages/dashboard/projects/new.js
import React, { useState } from 'react'; // ✅ Tambahkan useState
import {
  Box,
  Heading,
  useToast,
  Skeleton // ✅ Tambahkan Skeleton untuk loading state
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import ProjectForm from '../../../components/projects/ProjectForm';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router'; // ✅ Hapus axios

const NewProjectPage = () => {
  const [user, setUser] = useState({}); // ✅ useState sekarang diimpor
  const toast = useToast();
  const router = useRouter();

  // ✅ Mock user data untuk development/testing
  const mockUser = {
    id: 1,
    name: 'Mock User',
    role: 'project_lead', // Sesuaikan role jika perlu
    email: 'user@example.com'
  };

  // ✅ Mock useQuery untuk user (tidak perlu token atau axios)
  const { data: userData, isLoading: userLoading } = useQuery(
    'user',
    async () => {
      // ✅ Simulate delay untuk mock
      // await new Promise(resolve => setTimeout(resolve, 500)); 
      // Kembalikan mock data langsung
      return { user: mockUser };
    },
    {
      // ✅ onSuccess handler
      onSuccess: (data) => setUser(data.user)
    }
  );

  const handleSaveProject = (projectData) => {
    // ✅ Mock logic untuk save project
    console.log('Mock saving project:', projectData);
    toast({
      title: 'Project Created (Mock)',
      description: 'Project has been created successfully in mock mode.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    // Redirect to project detail page (gunakan ID mock jika perlu)
    // Untuk mock, kita bisa redirect ke dashboard projects atau buat ID dummy
    if (projectData.name) { // Ganti kondisi jika perlu
      // Misalnya, redirect ke detail project dengan ID dummy
      // router.push(`/dashboard/projects/mock-id-${Date.now()}`);
      // Atau kembali ke list projects
      router.push('/dashboard/projects');
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/projects');
  };

  // ✅ Tampilkan loading state jika perlu
  if (userLoading) {
    return (
      <DashboardLayout user={{}}>
        <Box p={6}>
          <Skeleton height="40px" width="200px" mb={6} />
          <Skeleton height="500px" width="100%" />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">
          Buat Proyek Baru (Mock Mode)
        </Heading>
        
        <ProjectForm 
          onSave={handleSaveProject}
          onCancel={handleCancel}
          isEditing={false}
        />
      </Box>
    </DashboardLayout>
  );
};

export default NewProjectPage;

// ✅ INI YANG PENTING: tambahkan ini di paling bawah untuk menghindari Prerender Error
export async function getStaticProps() {
  return {
    props: {} // props kosong untuk mockup/testing
  };
}