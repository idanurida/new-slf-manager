// client/src/pages/dashboard/projects/index.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Badge,
  Input,
  Select,
  useToast,
  Skeleton,
  VStack,
  HStack,
  Divider
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';

const ProjectsDashboard = () => {
  const [user, setUser] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState('');
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const toast = useToast();
  const router = useRouter();

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

  const {  projectsData, isLoading, refetch } = useQuery(
    ['projects', search, statusFilter, requestTypeFilter, limit, offset],
    async () => {
      const params = {
        search: search || undefined,
        status: statusFilter || undefined,
        request_type: requestTypeFilter || undefined,
        limit,
        offset
      };

      const response = await axios.get('/api/projects', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    { enabled: !!token }
  );

  const handleViewProject = (projectId) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleCreateProject = () => {
    router.push('/dashboard/projects/new');
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
          <Heading mb={6} color="blue.600">Projects Dashboard</Heading>
          
          <Skeleton height="40px" width="200px" mb={6} />
          
          <VStack spacing={4} mb={6}>
            <HStack spacing={4}>
              <Skeleton height="40px" width="200px" />
              <Skeleton height="40px" width="150px" />
              <Skeleton height="40px" width="150px" />
              <Skeleton height="40px" width="100px" />
            </HStack>
          </VStack>
          
          <Card>
            <CardBody>
              <Skeleton height="30px" width="150px" mb={4} />
              <VStack spacing={3}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} height="60px" width="100%" />
                ))}
              </VStack>
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
            <Heading color="blue.600">Projects Dashboard</Heading>
            <Button 
              colorScheme="green" 
              onClick={handleCreateProject}
              size="lg"
            >
              Create New Project
            </Button>
          </HStack>
          
          <Divider />
          
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Filter Section */}
                <HStack spacing={4} wrap="wrap">
                  <Input
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    width="250px"
                  />
                  
                  <Select
                    placeholder="Filter by Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    width="200px"
                  >
                    <option value="draft">Draft</option>
                    <option value="quotation_sent">Quotation Sent</option>
                    <option value="quotation_accepted">Quotation Accepted</option>
                    <option value="contract_signed">Contract Signed</option>
                    <option value="spk_issued">SPK Issued</option>
                    <option value="spk_accepted">SPK Accepted</option>
                    <option value="inspection_scheduled">Inspection Scheduled</option>
                    <option value="inspection_in_progress">Inspection In Progress</option>
                    <option value="inspection_done">Inspection Done</option>
                    <option value="report_draft">Report Draft</option>
                    <option value="report_reviewed">Report Reviewed</option>
                    <option value="report_sent_to_client">Report Sent to Client</option>
                    <option value="waiting_gov_response">Waiting Gov Response</option>
                    <option value="slf_issued">SLF Issued</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                  
                  <Select
                    placeholder="Filter by Request Type"
                    value={requestTypeFilter}
                    onChange={(e) => setRequestTypeFilter(e.target.value)}
                    width="200px"
                  >
                    <option value="baru">SLF Baru</option>
                    <option value="perpanjangan_slf">Perpanjangan SLF</option>
                    <option value="perubahan_fungsi">Perubahan Fungsi</option>
                    <option value="pascabencana">Pasca Bencana</option>
                  </Select>
                  
                  <Select
                    placeholder="Items per page"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value))}
                    width="150px"
                  >
                    <option value={10}>10 items</option>
                    <option value={20}>20 items</option>
                    <option value={50}>50 items</option>
                    <option value={100}>100 items</option>
                  </Select>
                </HStack>
                
                {/* Projects Table */}
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Project Name</Th>
                        <Th>Owner</Th>
                        <Th>Building Function</Th>
                        <Th>Floors</Th>
                        <Th>Request Type</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {projectsData && projectsData.projects && projectsData.projects.length > 0 ? (
                        projectsData.projects.map((project) => (
                          <Tr key={project.id}>
                            <Td>
                              <Text fontWeight="bold">{project.name}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {project.address}
                              </Text>
                            </Td>
                            <Td>{project.owner_name}</Td>
                            <Td>{project.building_function}</Td>
                            <Td>{project.floors}</Td>
                            <Td>
                              <Badge colorScheme="blue">
                                {project.request_type.replace(/_/g, ' ')}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={statusColors[project.status] || 'gray'}>
                                {project.status.replace(/_/g, ' ')}
                              </Badge>
                            </Td>
                            <Td>
                              <Button 
                                size="sm" 
                                colorScheme="blue"
                                onClick={() => handleViewProject(project.id)}
                              >
                                View Details
                              </Button>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={7} textAlign="center">
                            <Text color="gray.500">No projects found</Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
                
                {/* Pagination */}
                {projectsData && projectsData.total > limit && (
                  <HStack justify="space-between" mt={4}>
                    <Text fontSize="sm" color="gray.500">
                      Showing {offset + 1} to {Math.min(offset + limit, projectsData.total)} of {projectsData.total} projects
                    </Text>
                    
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        onClick={() => setOffset(Math.max(0, offset - limit))}
                        isDisabled={offset === 0}
                      >
                        Previous
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => setOffset(offset + limit)}
                        isDisabled={offset + limit >= projectsData.total}
                      >
                        Next
                      </Button>
                    </HStack>
                  </HStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default ProjectsDashboard;
