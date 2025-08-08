// client/src/pages/dashboard/projects/new.js
import React from 'react';
import {
  Box,
  Heading,
  useToast
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import ProjectForm from '../../../components/projects/ProjectForm';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';

const NewProjectPage = () => {
  const [user, setUser] = useState({});
  const toast = useToast();
  const router = useRouter();

  // Fetch user data
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const {  userData } = useQuery(
    'user',
    async () => {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    },
    { 
      enabled: !!token,
      onSuccess: (data) => setUser(data.user)
    }
  );

  const handleSaveProject = (projectData) => {
    // Redirect to project detail page
    if (projectData.id) {
      router.push(`/dashboard/projects/${projectData.id}`);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/projects');
  };

  return (
    <DashboardLayout user={user}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">
          Buat Proyek Baru
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
