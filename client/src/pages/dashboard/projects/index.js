// src/pages/dashboard/projects/index.js
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
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  IconButton,
  Tooltip,
  Input,
  InputGroup,
  InputLeftElement,
  Select
} from '@chakra-ui/react';
import { ViewIcon, EditIcon, AddIcon, SearchIcon } from '@chakra-ui/icons';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useRouter } from 'next/router';

// Mock data statis untuk testing frontend
const mockUser = {
  id: 1,
  name: 'Project Lead Mock User',
  role: 'project_lead',
  email: 'project.lead@example.com'
};

// Mock projects data
const mockProjects = [
  {
    id: 1,
    name: 'Project Alpha',
    owner: 'PT. Bangun Jaya',
    address: 'Jl. Sudirman No. 1, Jakarta',
    buildingFunction: 'Commercial',
    floors: 15,
    status: 'inspection_in_progress',
    progress: 75,
    createdAt: '2023-05-01T00:00:00Z',
    deadline: '2023-08-30T23:59:59Z'
  },
  {
    id: 2,
    name: 'Project Beta',
    owner: 'CV. Maju Terus',
    address: 'Jl. Thamrin No. 5, Bandung',
    buildingFunction: 'Residential',
    floors: 8,
    status: 'quotation_accepted',
    progress: 45,
    createdAt: '2023-05-15T00:00:00Z',
    deadline: '2023-09-15T23:59:59Z'
  },
  {
    id: 3,
    name: 'Project Gamma',
    owner: 'PT. Sejahtera Abadi',
    address: 'Jl. Diponegoro No. 10, Surabaya',
    buildingFunction: 'Industrial',
    floors: 3,
    status: 'slf_issued',
    progress: 100,
    createdAt: '2023-04-01T00:00:00Z',
    deadline: '2023-06-30T23:59:59Z'
  }
];

const ProjectsPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState(mockProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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

  const handleViewProject = (projectId) => {
    // Mock view project
    console.log('Viewing project:', projectId);
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleEditProject = (projectId) => {
    // Mock edit project
    console.log('Editing project:', projectId);
    router.push(`/dashboard/projects/${projectId}/edit`);
  };

  const handleCreateNewProject = () => {
    // Mock create new project
    console.log('Creating new project');
    toast({
      title: 'Create New Project',
      description: 'Opening create project form (mock)',
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  // Filter projects based on search term and status filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout user={mockUser}>
      <Box p={6}>
        <HStack justify="space-between" mb={6}>
          <Heading color="blue.600">Projects Management</Heading>
          <Button 
            colorScheme="blue" 
            leftIcon={<AddIcon />}
            onClick={handleCreateNewProject}
          >
            Create New Project
          </Button>
        </HStack>

        {/* Filter Section */}
        <Card mb={6}>
          <CardBody>
            <HStack spacing={4}>
              <InputGroup flex="1">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                placeholder="All Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                width="200px"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="quotation_accepted">Quotation Accepted</option>
                <option value="inspection_in_progress">Inspection In Progress</option>
                <option value="slf_issued">SLF Issued</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            {filteredProjects.length > 0 ? (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Project Name</Th>
                      <Th>Owner</Th>
                      <Th>Building Function</Th>
                      <Th>Floors</Th>
                      <Th>Status</Th>
                      <Th>Progress</Th>
                      <Th>Created At</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredProjects.map(project => (
                      <Tr key={project.id}>
                        <Td>
                          <Text fontWeight="bold">{project.name}</Text>
                          <Text fontSize="sm" color="gray.500">{project.address}</Text>
                        </Td>
                        <Td>{project.owner}</Td>
                        <Td>{project.buildingFunction}</Td>
                        <Td>{project.floors}</Td>
                        <Td>
                          <Badge colorScheme={statusColors[project.status] || 'gray'}>
                            {project.status.replace(/_/g, ' ')}
                          </Badge>
                        </Td>
                        <Td>{project.progress}%</Td>
                        <Td>{new Date(project.createdAt).toLocaleDateString('id-ID')}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="View Project">
                              <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                onClick={() => handleViewProject(project.id)}
                              />
                            </Tooltip>
                            <Tooltip label="Edit Project">
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleEditProject(project.id)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Alert status="info">
                <AlertIcon />
                <AlertTitle>No Projects Found</AlertTitle>
                <AlertDescription>
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No projects match your search criteria.'
                    : 'There are no projects created yet.'}
                </AlertDescription>
              </Alert>
            )}
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default ProjectsPage;

export async function getStaticProps() {
  return {
    props: {} // Kosongkan karena semua data di-mock di komponen
  };
}