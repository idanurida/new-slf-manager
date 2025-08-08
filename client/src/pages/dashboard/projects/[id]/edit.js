// client/src/pages/dashboard/projects/[id]/edit.js
import React from 'react';
import {
  Box,
  Heading,
  useToast,
  Skeleton
} from '@chakra-ui/react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import ProjectForm from '../../../../components/projects/ProjectForm';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useRouter } from 'next/router';

const EditProjectPage = () => {
  const [user, setUser] = useState({});
  const [project, setProject] = useState(null);
  const toast = useToast();
  const router = useRouter();
  const { id } = router.query;

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

  // Fetch project data
  const {  projectData, isLoading } = useQuery(
    ['project', id],
    async () => {
      if (!id) return null;
      
      const response = await axios.get(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.project || response.data;
    },
    { 
      enabled: !!token && !!id,
      onSuccess: (data) => setProject(data)
    }
  );

  const handleSaveProject = (updatedProject) => {
    // Redirect to project detail page
    if (updatedProject.id) {
      router.push(`/dashboard/projects/${updatedProject.id}`);
    }
  };

  const handleCancel = () => {
    if (project && project.id) {
      router.push(`/dashboard/projects/${project.id}`);
    } else {
      router.push('/dashboard/projects');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout user={user}>
        <Box p={6}>
          <Heading mb={6} color="blue.600">
            Edit Proyek
          </Heading>
          
          <Skeleton height="40px" width="200px" mb={6} />
          <Skeleton height="200px" mb={4} />
          <Skeleton height="200px" mb={4} />
          <Skeleton height="100px" mb={4} />
          <Skeleton height="100px" mb={4} />
          <Skeleton height="50px" width="150px" />
        </Box>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout user={user}>
        <Box p={6}>
          <Heading mb={6} color="blue.600">
            Edit Proyek
          </Heading>
          
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Proyek Tidak Ditemukan</AlertTitle>
            <AlertDescription>
              Proyek dengan ID {id} tidak ditemukan atau Anda tidak memiliki akses ke proyek ini.
            </AlertDescription>
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">
          Edit Proyek: {project.name}
        </Heading>
        
        <ProjectForm 
          project={project}
          onSave={handleSaveProject}
          onCancel={handleCancel}
          isEditing={true}
        />
      </Box>
    </DashboardLayout>
  );
};

export default EditProjectPage;