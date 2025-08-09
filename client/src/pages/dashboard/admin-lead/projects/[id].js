// client/src/pages/dashboard/admin-lead/projects/[id]/index.js
import React from 'react';
import {
  Box,
  Heading,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  HStack,
  VStack,
  useToast,
  IconButton,
  Tooltip,
  useDisclosure,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { AddIcon, ChevronRightIcon, ViewIcon, EditIcon, DownloadIcon, CalendarIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import DashboardLayout from 'components/layouts/DashboardLayout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ScheduleRequestForm from 'components/schedules/ScheduleRequestForm';

// Mock data untuk development/testing
const getMockProject = (id) => {
  const mockProjects = {
    '1': {
      id: '1',
      name: 'Mock Project Alpha',
      description: 'Deskripsi proyek Alpha',
      owner_name: 'PT. Bangun Jaya',
      status: 'inspection_in_progress'
    },
    '2': {
      id: '2',
      name: 'Mock Project Beta',
      description: 'Deskripsi proyek Beta',
      owner_name: 'CV. Maju Terus',
      status: 'quotation_accepted'
    }
  };
  return mockProjects[id] || null;
};

const getMockQuotations = (projectId) => {
  return [
    { id: 'q1', version: 'v1.0', amount: 150000000, status: 'Sent', created_at: '2023-05-01T00:00:00Z' },
    { id: 'q2', version: 'v1.1', amount: 160000000, status: 'Accepted', created_at: '2023-05-10T00:00:00Z' }
  ];
};

const getMockContracts = (projectId) => {
  return [
    { id: 'c1', title: 'Kontrak SLF Proyek Alpha', status: 'Signed', signed_at: '2023-05-15T00:00:00Z' }
  ];
};

const getMockSchedules = (projectId) => {
  return [
    { id: 's1', title: 'Inspeksi Awal', scheduled_date: '2023-06-01T10:00:00Z', status: 'Confirmed' },
    { id: 's2', title: 'Diskusi Revisi', scheduled_date: '2023-06-15T14:00:00Z', status: 'Pending Client Approval' }
  ];
};

const MotionBox = motion(Box);

const AdminProjectDetailPage = ({ mockProjectData, mockQuotationsData, mockContractsData, mockSchedulesData }) => {
  const router = useRouter();
  const { id: projectId } = router.query;
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Mock useQuery untuk project
  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      return mockProjectData || getMockProject(projectId);
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mock useQuery untuk quotations
  const { data: quotations, isLoading: isQuotationsLoading } = useQuery({
    queryKey: ['quotations', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return mockQuotationsData || getMockQuotations(projectId);
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mock useQuery untuk contracts
  const { data: contracts, isLoading: isContractsLoading } = useQuery({
    queryKey: ['contracts', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return mockContractsData || getMockContracts(projectId);
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mock useQuery untuk schedules
  const { data: schedules, isLoading: isSchedulesLoading } = useQuery({
    queryKey: ['schedules', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return mockSchedulesData || getMockSchedules(projectId);
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleScheduleCreated = () => {
    console.log('Mock schedule created, invalidating queries...');
  };

  const statusColors = {
    Draft: 'gray',
    Sent: 'blue',
    Accepted: 'green',
    Rejected: 'red',
    'Sent to Client': 'blue',
    Signed: 'green',
    Confirmed: 'green',
    'Pending Client Approval': 'yellow',
  };

  // Handle fallback state
  if (router.isFallback) {
    return (
      <DashboardLayout>
        <Box p={6}>
          <Skeleton height="20px" width="100px" mb={4} />
          <Skeleton height="40px" width="200px" mb={6} />
          <Skeleton height="300px" width="100%" />
        </Box>
      </DashboardLayout>
    );
  }

  // Handle error state
  if (isProjectError || (!project && !mockProjectData)) {
    return (
      <DashboardLayout>
        <Box p={6}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Project Not Found</AlertTitle>
            <AlertDescription>
              Project with ID {projectId} could not be found.
            </AlertDescription>
            <Button mt={4} onClick={() => router.push('/dashboard/admin-lead/projects')}>
              Back to Projects
            </Button>
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  // Handle loading state
  if ((isProjectLoading && !mockProjectData) || !projectId) {
    return (
      <DashboardLayout>
        <Box p={6}>
          <Skeleton height="20px" width="100px" mb={4} />
          <Skeleton height="40px" width="200px" mb={6} />
          <Tabs variant="enclosed-colored" colorScheme="blue">
            <TabList>
              <Tab>Quotations</Tab>
              <Tab>Contracts</Tab>
              <Tab>Schedules</Tab>
              <Tab>Other Documents</Tab>
            </TabList>
            <TabPanels>
              <TabPanel><Skeleton height="200px" /></TabPanel>
              <TabPanel><Skeleton height="200px" /></TabPanel>
              <TabPanel><Skeleton height="200px" /></TabPanel>
              <TabPanel><Skeleton height="100px" /></TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </DashboardLayout>
    );
  }

  const currentProject = project || mockProjectData;

  return (
    <DashboardLayout>
      <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <VStack spacing={6} align="stretch">
          <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => router.push('/dashboard/admin-lead')}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => router.push('/dashboard/admin-lead/projects')}>Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">{currentProject?.name || 'Loading...'}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Box>
            <Heading color="blue.600">{currentProject?.name}</Heading>
            <Text color="gray.600">Administrative Management (Mock Mode)</Text>
          </Box>

          <Tabs variant="enclosed-colored" colorScheme="blue">
            <TabList>
              <Tab>Quotations</Tab>
              <Tab>Contracts</Tab>
              <Tab>Schedules</Tab>
              <Tab>Other Documents</Tab>
            </TabList>
            <TabPanels>
              {/* Quotations Panel */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md">Quotation History</Heading>
                    <Button colorScheme="blue" leftIcon={<AddIcon />}>
                      Create New Quotation (Mock)
                    </Button>
                  </HStack>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Version</Th>
                          <Th>Amount</Th>
                          <Th>Status</Th>
                          <Th>Created At</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {isQuotationsLoading && !mockQuotationsData ? (
                          <Tr><Td colSpan={5}>Loading...</Td></Tr>
                        ) : (
                          (quotations || mockQuotationsData || []).map((q) => (
                            <Tr key={q.id}>
                              <Td fontWeight="bold">{q.version}</Td>
                              <Td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(q.amount)}</Td>
                              <Td><Badge colorScheme={statusColors[q.status] || 'gray'}>{q.status}</Badge></Td>
                              <Td>{new Date(q.created_at).toLocaleDateString('id-ID')}</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="View Quotation (Mock)"><IconButton icon={<ViewIcon />} size="sm" /></Tooltip>
                                  <Tooltip label="Download PDF (Mock)"><IconButton icon={<DownloadIcon />} size="sm" /></Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </VStack>
              </TabPanel>

              {/* Contracts Panel */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md">Contract Documents</Heading>
                    <Button colorScheme="blue" leftIcon={<AddIcon />}>
                      Create New Contract (Mock)
                    </Button>
                  </HStack>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Title</Th>
                          <Th>Status</Th>
                          <Th>Signed At</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {isContractsLoading && !mockContractsData ? (
                          <Tr><Td colSpan={4}>Loading...</Td></Tr>
                        ) : (
                          (contracts || mockContractsData || []).map((c) => (
                            <Tr key={c.id}>
                              <Td fontWeight="bold">{c.title}</Td>
                              <Td><Badge colorScheme={statusColors[c.status] || 'gray'}>{c.status}</Badge></Td>
                              <Td>{c.signed_at ? new Date(c.signed_at).toLocaleDateString('id-ID') : '-'}</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="View Details (Mock)"><IconButton icon={<ViewIcon />} size="sm" /></Tooltip>
                                  <Tooltip label="Upload Signed Document (Mock)"><IconButton icon={<EditIcon />} size="sm" /></Tooltip>
                                  <Tooltip label="Download (Mock)"><IconButton icon={<DownloadIcon />} size="sm" /></Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </VStack>
              </TabPanel>

              {/* Schedules Panel */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md">Meeting Schedules</Heading>
                    <Button colorScheme="blue" leftIcon={<CalendarIcon />} onClick={onOpen}>
                      Create New Schedule (Mock)
                    </Button>
                  </HStack>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Title</Th>
                          <Th>Date</Th>
                          <Th>Status</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {isSchedulesLoading && !mockSchedulesData ? (
                          <Tr><Td colSpan={4}>Loading...</Td></Tr>
                        ) : (
                          (schedules || mockSchedulesData || []).map((s) => (
                            <Tr key={s.id}>
                              <Td fontWeight="bold">{s.title}</Td>
                              <Td>{new Date(s.scheduled_date).toLocaleString('id-ID')}</Td>
                              <Td><Badge colorScheme={statusColors[s.status] || 'gray'}>{s.status}</Badge></Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="View Details (Mock)"><IconButton icon={<ViewIcon />} size="sm" /></Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </VStack>
              </TabPanel>

              {/* Other Documents Panel */}
              <TabPanel>
                <Text>Management for other administrative documents can be built here. (Mock Mode)</Text>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </MotionBox>
      <ScheduleRequestForm 
        isOpen={isOpen} 
        onClose={onClose} 
        projectId={projectId} 
        onScheduleCreated={handleScheduleCreated} 
      />
    </DashboardLayout>
  );
};

export default AdminProjectDetailPage;

// getStaticPaths untuk dynamic routes
export async function getStaticPaths() {
  const paths = [
    { params: { id: '1' } },
    { params: { id: '2' } },
  ];

  return {
    paths,
    fallback: 'blocking'
  };
}

// getStaticProps untuk prerender data
export async function getStaticProps(context) {
  const { id } = context.params;

  try {
    const mockProjectData = getMockProject(id);
    
    if (!mockProjectData) {
      return {
        notFound: true,
      };
    }

    const mockQuotationsData = getMockQuotations(id);
    const mockContractsData = getMockContracts(id);
    const mockSchedulesData = getMockSchedules(id);

    return {
      props: {
        mockProjectData,
        mockQuotationsData,
        mockContractsData,
        mockSchedulesData
      },
      revalidate: 60, // ISR - revalidate every 60 seconds
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      notFound: true,
    };
  }
}