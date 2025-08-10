// src/pages/dashboard/client/index.js
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  IconButton,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { ViewIcon, DownloadIcon } from '@chakra-ui/icons';
// --- PERBAIKAN PATH IMPOR BERDASARKAN jsconfig.json ---
// Path relatif sebelumnya: import DashboardLayout from '../../../components/layouts/DashboardLayout'
// Path absolut berdasarkan konfigurasi:
// baseUrl: "src"
// paths: { "components/*": ["components/*"] }
import DashboardLayout from 'components/layouts/DashboardLayout'; // ✅ Gunakan path absolut
// -------------------------------------------------------
import { useRouter } from 'next/router';

// Mock data statis untuk testing frontend
const mockUser = {
  id: 1,
  name: 'Client Mock User',
  role: 'client',
  email: 'client@example.com',
  company: 'PT. Contoh Perusahaan'
};

// Mock projects data untuk client
const mockProjects = [
  {
    id: 1,
    name: 'Project Alpha',
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
    buildingFunction: 'Residential',
    floors: 8,
    status: 'quotation_accepted',
    progress: 45,
    createdAt: '2023-05-15T00:00:00Z',
    deadline: '2023-09-15T23:59:59Z'
  }
];

// Mock documents data untuk client
const mockDocuments = [
  {
    id: 1,
    name: 'Quotation_v1.0.pdf',
    type: 'Quotation',
    size: 2457600, // 2.4 MB
    uploadedAt: '2023-05-05T10:30:00Z',
    status: 'sent',
    projectId: 1,
    projectName: 'Project Alpha'
  },
  {
    id: 2,
    name: 'Contract_Draft.pdf',
    type: 'Contract',
    size: 1835008, // 1.8 MB
    uploadedAt: '2023-05-20T14:20:00Z',
    status: 'signed',
    projectId: 1,
    projectName: 'Project Alpha'
  },
  {
    id: 3,
    name: 'SLF_Document.pdf',
    type: 'SLF',
    size: 3145728, // 3.1 MB
    uploadedAt: '2023-06-15T09:15:00Z',
    status: 'issued',
    projectId: 2,
    projectName: 'Project Beta'
  }
];

// Helper function untuk format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ClientDashboard = () => {
  const router = useRouter();
  const [projects, setProjects] = useState(mockProjects);
  const [documents, setDocuments] = useState(mockDocuments);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const statusColors = {
    draft: 'gray',
    sent: 'yellow',
    accepted: 'green',
    rejected: 'red',
    signed: 'green',
    issued: 'green',
    pending: 'yellow',
    quotation_sent: 'yellow',
    quotation_accepted: 'orange',
    inspection_in_progress: 'orange',
    slf_issued: 'green'
  };

  const handleViewProject = (projectId) => {
    // Mock view project
    console.log('Viewing project:', projectId);
    router.push(`/dashboard/client/projects/${projectId}`);
  };

  const handleViewDocument = (documentId) => {
    // Mock view document
    console.log('Viewing document:', documentId);
    toast({
      title: 'View Document',
      description: `Opening document #${documentId} (mock)`,
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  const handleDownloadDocument = (documentId) => {
    // Mock download document
    console.log('Downloading document:', documentId);
    toast({
      title: 'Download Document',
      description: `Downloading document #${documentId} (mock)`,
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  return (
    <DashboardLayout user={mockUser}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">Client Dashboard</Heading>
        <Text mb={8} fontSize="lg" color="gray.600">
          Welcome, {mockUser.name} ({mockUser.company})
        </Text>

        <Tabs variant="enclosed-colored" colorScheme="blue">
          <TabList>
            <Tab>My Projects</Tab>
            <Tab>Documents</Tab>
          </TabList>

          <TabPanels>
            {/* Projects Panel */}
            <TabPanel>
              <Card>
                <CardBody>
                  {projects.length > 0 ? (
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Project Name</Th>
                            <Th>Building Function</Th>
                            <Th>Floors</Th>
                            <Th>Status</Th>
                            <Th>Progress</Th>
                            <Th>Created At</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {projects.map(project => (
                            <Tr key={project.id}>
                              <Td>
                                <Text fontWeight="bold">{project.name}</Text>
                              </Td>
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
                                <Tooltip label="View Project">
                                  <IconButton
                                    icon={<ViewIcon />}
                                    size="sm"
                                    onClick={() => handleViewProject(project.id)}
                                  />
                                </Tooltip>
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
                        You don't have any projects yet.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Documents Panel */}
            <TabPanel>
              <Card>
                <CardBody>
                  {documents.length > 0 ? (
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Document Name</Th>
                            <Th>Project</Th>
                            <Th>Type</Th>
                            <Th>Size</Th>
                            <Th>Uploaded At</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {documents.map(document => (
                            <Tr key={document.id}>
                              <Td>
                                <Text fontWeight="bold">{document.name}</Text>
                              </Td>
                              <Td>{document.projectName}</Td>
                              <Td>{document.type}</Td>
                              <Td>{formatBytes(document.size)}</Td>
                              <Td>{new Date(document.uploadedAt).toLocaleDateString('id-ID')}</Td>
                              <Td>
                                <Badge colorScheme={statusColors[document.status] || 'gray'}>
                                  {document.status}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="View Document">
                                    <IconButton
                                      icon={<ViewIcon />}
                                      size="sm"
                                      onClick={() => handleViewDocument(document.id)}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Download Document">
                                    <IconButton
                                      icon={<DownloadIcon />}
                                      size="sm"
                                      colorScheme="green"
                                      onClick={() => handleDownloadDocument(document.id)}
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
                      <AlertTitle>No Documents Found</AlertTitle>
                      <AlertDescription>
                        There are no documents available for you yet.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </DashboardLayout>
  );
};

// --- PERBAIKAN: Penghapusan getStaticProps karena tidak diperlukan ---
// Jika Anda membutuhkan data statis dari API di masa depan, Anda bisa menambahkannya kembali di sini.
// export async function getStaticProps() {
//   return {
//     props: {} // Kosongkan karena semua data di-mock di komponen
//   };
// }
// -----------------------------------------------------------------------

export default ClientDashboard;