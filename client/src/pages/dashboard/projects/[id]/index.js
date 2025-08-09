// client/src/pages/dashboard/projects/[id]/index.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  VStack,
  HStack,
  Badge,
  Divider,
  useToast,
  Skeleton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
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

const ProjectDetail = ({ mockProjectData, mockUserData }) => {
  const [user, setUser] = useState(mockUserData || {});
  const [project, setProject] = useState(mockProjectData || null);
  const toast = useToast();
  const router = useRouter();
  const { id } = router.query;

  // Mock useQuery untuk user dengan konfigurasi yang benar
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      return { user: mockUserData || mockUser };
    },
    enabled: !!mockUserData,
    staleTime: 1000 * 60 * 5,
    onSuccess: (data) => setUser(data.user),
  });

  // Mock useQuery untuk project dengan konfigurasi yang benar
  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      return mockProjectData || getMockProject(id);
    },
    enabled: !!id && !mockProjectData,
    staleTime: 1000 * 60 * 5,
    onSuccess: (data) => setProject(data),
  });

  const isLoading = userLoading || projectLoading;

  const handleEditProject = () => {
    router.push(`/dashboard/projects/${id}/edit`);
  };

  const handleViewInspections = () => {
    router.push(`/dashboard/projects/${id}/inspections`);
  };

  const handleViewReports = () => {
    router.push(`/dashboard/projects/${id}/reports`);
  };

  const handleViewPayments = () => {
    router.push(`/dashboard/projects/${id}/payments`);
  };

  const handleViewDocuments = () => {
    router.push(`/dashboard/projects/${id}/documents`);
  };

  const statusColors = {
    draft: 'gray',
    quotation_sent: 'yellow',
    quotation_accepted: 'orange',
    contract_signed: 'purple',
    spk_issued: 'blue',
    spk_accepted: 'teal',
    inspection_scheduled: 'cyan',
    inspection_in_progress: 'orange',
    inspection_done: 'green',
    report_draft: 'yellow',
    report_reviewed: 'orange',
    report_sent_to_client: 'purple',
    waiting_gov_response: 'pink',
    slf_issued: 'green',
    completed: 'green',
    cancelled: 'red'
  };

  // Handle fallback state
  if (router.isFallback) {
    return (
      <DashboardLayout user={user}>
        <Box p={6}>
          <Skeleton height="40px" width="300px" mb={6} />
          <VStack spacing={4} align="stretch">
            <Card>
              <CardBody>
                <Skeleton height="30px" width="200px" mb={4} />
                <VStack spacing={3} align="stretch">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} height="20px" width="100%" />
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <DashboardLayout user={userData || {}}>
        <Box p={6}>
          <Heading mb={6} color="blue.600">Project Details</Heading>
          
          <Skeleton height="40px" width="300px" mb={6} />
          
          <VStack spacing={4} align="stretch">
            <Card>
              <CardBody>
                <Skeleton height="30px" width="200px" mb={4} />
                <VStack spacing={3} align="stretch">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} height="20px" width="100%" />
                  ))}
                </VStack>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Skeleton height="30px" width="150px" mb={4} />
                <VStack spacing={3} align="stretch">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height="40px" width="100%" />
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  // Handle error state
  if (!project && !mockProjectData) {
    return (
      <DashboardLayout user={userData || user || {}}>
        <Box p={6}>
          <Heading mb={6} color="blue.600">Project Details</Heading>
          
          <Card>
            <CardBody>
              <Text color="red.500">Project not found or you don't have access to this project.</Text>
              <Button 
                colorScheme="blue" 
                mt={4}
                onClick={() => router.push('/dashboard/projects')}
              >
                Back to Projects
              </Button>
            </CardBody>
          </Card>
        </Box>
      </DashboardLayout>
    );
  }

  const projectToDisplay = mockProjectData || project;

  return (
    <DashboardLayout user={userData || user || {}}>
      <Box p={6}>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Heading color="blue.600">Project Details: {projectToDisplay?.name}</Heading>
            <Button 
              colorScheme="blue" 
              onClick={handleEditProject}
              size="lg"
            >
              Edit Project
            </Button>
          </HStack>
          
          <Divider />
          
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="gray.700">Project Information</Heading>
                
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Project Name:</Text>
                    <Text>{projectToDisplay?.name}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Owner Name:</Text>
                    <Text>{projectToDisplay?.owner_name}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Address:</Text>
                    <Text>{projectToDisplay?.address}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Building Function:</Text>
                    <Text>{projectToDisplay?.building_function}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Floors:</Text>
                    <Text>{projectToDisplay?.floors}</Text>
                  </HStack>
                  
                  {projectToDisplay?.height && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Height:</Text>
                      <Text>{projectToDisplay.height} meters</Text>
                    </HStack>
                  )}
                  
                  {projectToDisplay?.area && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Area:</Text>
                      <Text>{projectToDisplay.area} m²</Text>
                    </HStack>
                  )}
                  
                  {projectToDisplay?.location && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Location:</Text>
                      <Text>{projectToDisplay.location}</Text>
                    </HStack>
                  )}
                  
                  {projectToDisplay?.coordinates && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Coordinates:</Text>
                      <Text>{projectToDisplay.coordinates}</Text>
                    </HStack>
                  )}
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Request Type:</Text>
                    <Badge colorScheme="blue">
                      {projectToDisplay?.request_type?.replace(/_/g, ' ') || 'N/A'}
                    </Badge>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Status:</Text>
                    <Badge colorScheme={statusColors[projectToDisplay?.status] || 'gray'}>
                      {projectToDisplay?.status?.replace(/_/g, ' ') || 'N/A'}
                    </Badge>
                  </HStack>
                  
                  {projectToDisplay?.projectLead && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Project Lead:</Text>
                      <Text>{projectToDisplay.projectLead.name} ({projectToDisplay.projectLead.email})</Text>
                    </HStack>
                  )}
                  
                  {projectToDisplay?.client && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Client:</Text>
                      <Text>{projectToDisplay.client.name} ({projectToDisplay.client.email})</Text>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
          
          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList>
              <Tab>Inspections</Tab>
              <Tab>Reports</Tab>
              <Tab>Payments</Tab>
              <Tab>Documents</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md" color="gray.700">Inspection Management</Heading>
                      
                      <Text>
                        Manage all inspection activities for this project.
                      </Text>
                      
                      <HStack spacing={4}>
                        <Button 
                          colorScheme="blue" 
                          onClick={handleViewInspections}
                        >
                          View Inspections
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          colorScheme="green"
                          onClick={() => router.push(`/dashboard/projects/${id}/inspections/schedule`)}
                        >
                          Schedule New Inspection
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              <TabPanel>
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md" color="gray.700">Report Management</Heading>
                      
                      <Text>
                        Generate and manage SLF reports for this project.
                      </Text>
                      
                      <HStack spacing={4}>
                        <Button 
                          colorScheme="blue" 
                          onClick={handleViewReports}
                        >
                          View Reports
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          colorScheme="green"
                          onClick={() => router.push(`/dashboard/projects/${id}/reports/generate`)}
                        >
                          Generate New Report
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              <TabPanel>
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md" color="gray.700">Payment Management</Heading>
                      
                      <Text>
                        Track and verify payments for this project.
                      </Text>
                      
                      <HStack spacing={4}>
                        <Button 
                          colorScheme="blue" 
                          onClick={handleViewPayments}
                        >
                          View Payments
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          colorScheme="green"
                          onClick={() => router.push(`/dashboard/projects/${id}/payments/upload`)}
                        >
                          Upload Payment Proof
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              <TabPanel>
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md" color="gray.700">Document Management</Heading>
                      
                      <Text>
                        Upload and manage project documents.
                      </Text>
                      
                      <HStack spacing={4}>
                        <Button 
                          colorScheme="blue" 
                          onClick={handleViewDocuments}
                        >
                          View Documents
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          colorScheme="green"
                          onClick={() => router.push(`/dashboard/projects/${id}/documents/upload`)}
                        >
                          Upload New Document
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default ProjectDetail;

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