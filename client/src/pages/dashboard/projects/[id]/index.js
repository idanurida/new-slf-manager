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
import axios from 'axios';
import { useRouter } from 'next/router';

const ProjectDetail = () => {
  const [user, setUser] = useState({});
  const [project, setProject] = useState(null);
  const toast = useToast();
  const router = useRouter();
  const { id } = router.query;

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

  const {  projectData, isLoading } = useQuery(
    ['project', id],
    async () => {
      if (!id) return null;
      
      const response = await axios.get(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    { 
      enabled: !!token && !!id,
      onSuccess: (data) => setProject(data)
    }
  );

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

  if (!project) {
    return (
      <DashboardLayout user={userData || {}}>
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

  return (
    <DashboardLayout user={userData || {}}>
      <Box p={6}>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Heading color="blue.600">Project Details: {project.name}</Heading>
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
                    <Text>{project.name}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Owner Name:</Text>
                    <Text>{project.owner_name}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Address:</Text>
                    <Text>{project.address}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Building Function:</Text>
                    <Text>{project.building_function}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Floors:</Text>
                    <Text>{project.floors}</Text>
                  </HStack>
                  
                  {project.height && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Height:</Text>
                      <Text>{project.height} meters</Text>
                    </HStack>
                  )}
                  
                  {project.area && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Area:</Text>
                      <Text>{project.area} m²</Text>
                    </HStack>
                  )}
                  
                  {project.location && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Location:</Text>
                      <Text>{project.location}</Text>
                    </HStack>
                  )}
                  
                  {project.coordinates && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Coordinates:</Text>
                      <Text>{project.coordinates}</Text>
                    </HStack>
                  )}
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Request Type:</Text>
                    <Badge colorScheme="blue">
                      {project.request_type.replace(/_/g, ' ')}
                    </Badge>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Status:</Text>
                    <Badge colorScheme={statusColors[project.status] || 'gray'}>
                      {project.status.replace(/_/g, ' ')}
                    </Badge>
                  </HStack>
                  
                  {project.projectLead && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Project Lead:</Text>
                      <Text>{project.projectLead.name} ({project.projectLead.email})</Text>
                    </HStack>
                  )}
                  
                  {project.client && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Client:</Text>
                      <Text>{project.client.name} ({project.client.email})</Text>
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