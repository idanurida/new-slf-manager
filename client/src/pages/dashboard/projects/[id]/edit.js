// client/src/pages/dashboard/projects/[id]/edit.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
} from '@chakra-ui/react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import ProjectForm from '../../../../components/projects/ProjectForm';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

// Mock data untuk development/testing
const mockUser = {
  id: 1,
  name: 'Mock User',
  role: 'project_lead',
  email: 'user@example.com'
};

// Mock data project berdasarkan ID
const getMockProject = (id) => {
  const mockProjects = {
    '1': {
      id: '1',
      name: 'Mock Project Alpha',
      owner_name: 'PT. Bangun Jaya',
      address: 'Jl. Sudirman No. 1, Jakarta',
      building_function: 'Commercial',
      floors: 15,
      height: 60,
      area: 5000,
      location: 'Jakarta Pusat',
      coordinates: '-6.2146, 106.8451',
      request_type: 'baru',
      status: 'inspection_in_progress',
      projectLead: { name: 'John Doe', email: 'john@example.com' },
      client: { name: 'Client A', email: 'clienta@example.com' }
    },
    '2': {
      id: '2',
      name: 'Mock Project Beta',
      owner_name: 'CV. Maju Terus',
      address: 'Jl. Thamrin No. 5, Bandung',
      building_function: 'Residential',
      floors: 8,
      height: 24,
      area: 2000,
      location: 'Bandung',
      coordinates: '-6.9175, 107.6191',
      request_type: 'perpanjangan_slf',
      status: 'quotation_accepted',
      projectLead: { name: 'Jane Smith', email: 'jane@example.com' },
      client: { name: 'Client B', email: 'clientb@example.com' }
    },
    '3': {
      id: '3',
      name: 'Mock Project Gamma',
      owner_name: 'PT. Sejahtera Abadi',
      address: 'Jl. Diponegoro No. 10, Surabaya',
      building_function: 'Industrial',
      floors: 3,
      height: 15,
      area: 1500,
      location: 'Surabaya',
      coordinates: '-7.2575, 112.7521',
      request_type: 'perubahan_fungsi',
      status: 'slf_issued',
      projectLead: { name: 'Bob Johnson', email: 'bob@example.com' },
      client: { name: 'Client C', email: 'clientc@example.com' }
    }
  };
  return mockProjects[id] || null;
};

const EditProjectPage = ({ mockProjectData, mockUserData }) => {
  const [user, setUser] = useState(mockUserData || {});
  const [project, setProject] = useState(mockProjectData || null);
  const toast = useToast();
  const router = useRouter();
  const { id } = router.query;

  // Mock useQuery untuk user dengan konfigurasi yang benar
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      return mockUserData || mockUser;
    },
    enabled: !!mockUserData,
    staleTime: 1000 * 60 * 5,
  });

  // Mock useQuery untuk project dengan konfigurasi yang benar
  const { data: projectData, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      return mockProjectData || getMockProject(id);
    },
    enabled: !!id && !mockProjectData,
    staleTime: 1000 * 60 * 5,
  });

  const handleSaveProject = (updatedProject) => {
    console.log('Mock saving updated project:', updatedProject);
    toast({
      title: 'Project Updated (Mock)',
      description: 'Project has been updated successfully in mock mode.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    if (updatedProject?.id) {
      router.push(`/dashboard/projects/${updatedProject.id}`);
    } else if (id) {
      router.push(`/dashboard/projects/${id}`);
    } else {
      router.push('/dashboard/projects');
    }
  };

  const handleCancel = () => {
    if (project?.id) {
      router.push(`/dashboard/projects/${project.id}`);
    } else if (id) {
      router.push(`/dashboard/projects/${id}`);
    } else {
      router.push('/dashboard/projects');
    }
  };

  const isLoading = isUserLoading || isProjectLoading;

  // Handle fallback state
  if (router.isFallback) {
    return (
      <DashboardLayout user={user}>
        <Box p={6}>
          <Skeleton height="40px" width="200px" mb={6} />
          <Skeleton height="200px" mb={4} />
          <Skeleton height="200px" mb={4} />
        </Box>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout user={user}>
        <Box p={6}>
          <Heading mb={6} color="blue.600">Edit Proyek</Heading>
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

  // Handle error state
  if (!projectData && !mockProjectData) {
    return (
      <DashboardLayout user={user}>
        <Box p={6}>
          <Heading mb={6} color="blue.600">Edit Proyek</Heading>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Proyek Tidak Ditemukan</AlertTitle>
            <AlertDescription>
              Proyek dengan ID {id} tidak ditemukan atau Anda tidak memiliki akses.
            </AlertDescription>
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  const projectToDisplay = mockProjectData || projectData || project;

  return (
    <DashboardLayout user={userData || user || {}}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">
          Edit Proyek: {projectToDisplay?.name} (Mock Mode)
        </Heading>
        <ProjectForm
          project={projectToDisplay}
          onSave={handleSaveProject}
          onCancel={handleCancel}
          isEditing={true}
        />
      </Box>
    </DashboardLayout>
  );
};

export default EditProjectPage;

// getStaticPaths untuk dynamic routes
export async function getStaticPaths() {
  try {
    const paths = [
      { params: { id: '1' } },
      { params: { id: '2' } },
      { params: { id: '3' } },
    ];

    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

// getStaticProps untuk prerender data
export async function getStaticProps(context) {
  const { id } = context.params;

  try {
    // Validasi ID
    if (!id || typeof id !== 'string') {
      return {
        notFound: true,
      };
    }

    const mockProjectData = getMockProject(id);
    
    if (!mockProjectData) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        mockProjectData,
        mockUserData: mockUser
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      notFound: true,
    };
  }
}