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
  useDisclosure
} from '@chakra-ui/react';
import { AddIcon, ChevronRightIcon, ViewIcon, EditIcon, DownloadIcon, CalendarIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { useQuery, useQueryClient } from 'react-query';
import { adminService, projectService, scheduleService } from 'services/api';
import ScheduleRequestForm from '../../../../../components/schedules/ScheduleRequestForm';

const MotionBox = motion(Box);

const AdminProjectDetailPage = () => {
  const router = useRouter();
  const { id: projectId } = router.query;
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure(); // For schedule modal

  // Fetch project details
  const { data: project, isLoading: isProjectLoading } = useQuery(
    ['project', projectId],
    () => projectService.getProjectById(projectId),
    { enabled: !!projectId }
  );

  // Fetch quotations for this project
  const { data: quotations, isLoading: isQuotationsLoading } = useQuery(
    ['quotations', projectId],
    () => adminService.getProjectQuotations(projectId),
    { enabled: !!projectId }
  );

  // Fetch contracts for this project
  const { data: contracts, isLoading: isContractsLoading } = useQuery(
    ['contracts', projectId],
    () => adminService.getProjectContracts(projectId),
    { enabled: !!projectId }
  );

  // Fetch schedules for this project
  const { data: schedules, isLoading: isSchedulesLoading } = useQuery(
    ['schedules', projectId],
    () => scheduleService.getProjectScheduleRequests(projectId),
    { enabled: !!projectId }
  );

  const handleScheduleCreated = () => {
    queryClient.invalidateQueries(['schedules', projectId]);
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
              <BreadcrumbLink href="#">{project?.data?.name || 'Loading...'}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Box>
            <Heading color="blue.600">{project?.data?.name}</Heading>
            <Text color="gray.600">Administrative Management</Text>
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
                      Create New Quotation
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
                        {isQuotationsLoading ? (
                          <Tr><Td colSpan={5}>Loading...</Td></Tr>
                        ) : (
                          quotations?.data?.map((q) => (
                            <Tr key={q.id}>
                              <Td fontWeight="bold">{q.version}</Td>
                              <Td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(q.amount)}</Td>
                              <Td><Badge colorScheme={statusColors[q.status] || 'gray'}>{q.status}</Badge></Td>
                              <Td>{new Date(q.created_at).toLocaleDateString('id-ID')}</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="View Quotation"><IconButton icon={<ViewIcon />} size="sm" /></Tooltip>
                                  <Tooltip label="Download PDF"><IconButton icon={<DownloadIcon />} size="sm" /></Tooltip>
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
                      Create New Contract
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
                        {isContractsLoading ? (
                          <Tr><Td colSpan={4}>Loading...</Td></Tr>
                        ) : (
                          contracts?.data?.map((c) => (
                            <Tr key={c.id}>
                              <Td fontWeight="bold">{c.title}</Td>
                              <Td><Badge colorScheme={statusColors[c.status] || 'gray'}>{c.status}</Badge></Td>
                              <Td>{c.signed_at ? new Date(c.signed_at).toLocaleDateString('id-ID') : '-'}</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="View Details"><IconButton icon={<ViewIcon />} size="sm" /></Tooltip>
                                  <Tooltip label="Upload Signed Document"><IconButton icon={<EditIcon />} size="sm" /></Tooltip>
                                  <Tooltip label="Download"><IconButton icon={<DownloadIcon />} size="sm" /></Tooltip>
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
                      Create New Schedule
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
                        {isSchedulesLoading ? (
                          <Tr><Td colSpan={4}>Loading...</Td></Tr>
                        ) : (
                          schedules?.data?.map((s) => (
                            <Tr key={s.id}>
                              <Td fontWeight="bold">{s.title}</Td>
                              <Td>{new Date(s.scheduled_date).toLocaleString('id-ID')}</Td>
                              <Td><Badge colorScheme={statusColors[s.status] || 'gray'}>{s.status}</Badge></Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="View Details"><IconButton icon={<ViewIcon />} size="sm" /></Tooltip>
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
                <Text>Management for other administrative documents can be built here.</Text>
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