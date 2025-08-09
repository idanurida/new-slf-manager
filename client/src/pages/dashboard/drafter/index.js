// src/pages/dashboard/drafter/index.js
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
  Tooltip
} from '@chakra-ui/react';
import { ViewIcon, EditIcon, DownloadIcon } from '@chakra-ui/icons';
import DashboardLayout from '../../../components/layouts/DashboardLayout'
import { useRouter } from 'next/router';

// Mock data statis untuk testing frontend
const mockUser = {
  id: 1,
  name: 'Drafter Mock User',
  role: 'drafter',
  email: 'drafter@example.com'
};

// Mock reports data untuk drafter
const mockReports = [
  {
    id: 1,
    title: 'SLF Report - Project Alpha',
    project: 'Project Alpha',
    client: 'PT. Bangun Jaya',
    status: 'draft',
    createdAt: '2023-06-01T10:30:00Z',
    updatedAt: '2023-06-15T14:20:00Z'
  },
  {
    id: 2,
    title: 'Inspection Report - Project Beta',
    project: 'Project Beta',
    client: 'CV. Maju Terus',
    status: 'review',
    createdAt: '2023-06-05T09:15:00Z',
    updatedAt: '2023-06-10T11:30:00Z'
  },
  {
    id: 3,
    title: 'Final SLF Document - Project Gamma',
    project: 'Project Gamma',
    client: 'PT. Sejahtera Abadi',
    status: 'approved',
    createdAt: '2023-05-20T13:45:00Z',
    updatedAt: '2023-06-01T16:20:00Z'
  }
];

const DrafterDashboard = () => {
  const router = useRouter();
  const [reports, setReports] = useState(mockReports);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const statusColors = {
    draft: 'gray',
    review: 'yellow',
    approved: 'green',
    rejected: 'red'
  };

  const handleViewReport = (reportId) => {
    // Mock view report
    console.log('Viewing report:', reportId);
    router.push(`/dashboard/drafter/reports/${reportId}`);
  };

  const handleEditReport = (reportId) => {
    // Mock edit report
    console.log('Editing report:', reportId);
    router.push(`/dashboard/drafter/reports/${reportId}/edit`);
  };

  const handleDownloadReport = (reportId) => {
    // Mock download report
    console.log('Downloading report:', reportId);
    toast({
      title: 'Download Report',
      description: `Downloading report #${reportId} (mock)`,
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  const handleCreateNewReport = () => {
    // Mock create new report
    console.log('Creating new report');
    toast({
      title: 'Create New Report',
      description: 'Opening create report form (mock)',
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  return (
    <DashboardLayout user={mockUser}>
      <Box p={6}>
        <HStack justify="space-between" mb={6}>
          <Heading color="blue.600">Drafter Dashboard</Heading>
          <Button 
            colorScheme="blue" 
            onClick={handleCreateNewReport}
          >
            Create New Report
          </Button>
        </HStack>

        <Card>
          <CardBody>
            {reports.length > 0 ? (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Report Title</Th>
                      <Th>Project</Th>
                      <Th>Client</Th>
                      <Th>Status</Th>
                      <Th>Created At</Th>
                      <Th>Last Updated</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {reports.map(report => (
                      <Tr key={report.id}>
                        <Td>
                          <Text fontWeight="bold">{report.title}</Text>
                        </Td>
                        <Td>{report.project}</Td>
                        <Td>{report.client}</Td>
                        <Td>
                          <Badge colorScheme={statusColors[report.status] || 'gray'}>
                            {report.status}
                          </Badge>
                        </Td>
                        <Td>{new Date(report.createdAt).toLocaleDateString('id-ID')}</Td>
                        <Td>{new Date(report.updatedAt).toLocaleDateString('id-ID')}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="View Report">
                              <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                onClick={() => handleViewReport(report.id)}
                              />
                            </Tooltip>
                            <Tooltip label="Edit Report">
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleEditReport(report.id)}
                              />
                            </Tooltip>
                            <Tooltip label="Download Report">
                              <IconButton
                                icon={<DownloadIcon />}
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleDownloadReport(report.id)}
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
                <AlertTitle>No Reports Found</AlertTitle>
                <AlertDescription>
                  There are no reports created yet.
                </AlertDescription>
              </Alert>
            )}
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default DrafterDashboard;

export async function getStaticProps() {
  return {
    props: {} // Kosongkan karena semua data di-mock di komponen
  };
}