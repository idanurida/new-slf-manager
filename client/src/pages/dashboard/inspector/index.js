// src/pages/dashboard/inspector/index.js
import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  VStack,
  HStack,
  Divider
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useRouter } from 'next/router';

// Import komponen dari folder components/inspections/
import DynamicChecklistForm from '../../../../components/inspections/DynamicChecklistForm';
import InspectionDetail from '../../../../components/inspections/InspectionDetail';
import InspectionList from '../../../../components/inspections/InspectionList';
import PhotoGallery from '../../../../components/inspections/PhotoGallery';
import PhotoUpload from '../../../../components/inspections/PhotoUpload';

// Mock data statis untuk testing frontend
const mockUser = {
  id: 1,
  name: 'Inspector Mock User',
  role: 'inspector',
  email: 'inspector@example.com'
};

const mockStats = {
  totalInspections: 12,
  pendingInspections: 5,
  completedInspections: 7,
  upcomingInspections: 3
};

const mockPendingInspections = [
  {
    id: 1,
    projectName: 'Project Alpha',
    client: 'PT. Bangun Jaya',
    scheduledDate: '2023-06-20T10:00:00Z',
    location: 'Jakarta',
    status: 'scheduled'
  },
  {
    id: 2,
    projectName: 'Project Beta',
    client: 'CV. Maju Terus',
    scheduledDate: '2023-06-25T14:00:00Z',
    location: 'Bandung',
    status: 'scheduled'
  }
];

const InspectorDashboard = () => {
  const router = useRouter();

  const handleViewInspection = (inspectionId) => {
    router.push(`/dashboard/inspector/inspections/${inspectionId}`);
  };

  const statusColors = {
    scheduled: 'blue',
    in_progress: 'orange',
    completed: 'green',
    cancelled: 'red'
  };

  const StatCard = ({ label, value }) => (
    <Card>
      <CardBody>
        <Stat>
          <StatLabel>{label}</StatLabel>
          <StatNumber>{value}</StatNumber>
        </Stat>
      </CardBody>
    </Card>
  );

  return (
    <DashboardLayout user={mockUser}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">Inspector Dashboard</Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <StatCard label="Total Inspections" value={mockStats.totalInspections} />
          <StatCard label="Pending Inspections" value={mockStats.pendingInspections} />
          <StatCard label="Completed Inspections" value={mockStats.completedInspections} />
          <StatCard label="Upcoming Inspections" value={mockStats.upcomingInspections} />
        </SimpleGrid>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Pending Inspections</Heading>
            {mockPendingInspections.length > 0 ? (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Project</Th>
                      <Th>Client</Th>
                      <Th>Scheduled Date</Th>
                      <Th>Location</Th>
                      <Th>Status</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {mockPendingInspections.map(inspection => (
                      <Tr key={inspection.id}>
                        <Td>
                          <Text fontWeight="bold">{inspection.projectName}</Text>
                        </Td>
                        <Td>{inspection.client}</Td>
                        <Td>{new Date(inspection.scheduledDate).toLocaleString('id-ID')}</Td>
                        <Td>{inspection.location}</Td>
                        <Td>
                          <Badge colorScheme={statusColors[inspection.status]}>
                            {inspection.status.replace(/_/g, ' ')}
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleViewInspection(inspection.id)}
                          >
                            View
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Text>No pending inspections</Text>
            )}
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default InspectorDashboard;

export async function getStaticProps() {
  return {
    props: {} // Kosongkan karena semua data di-mock di komponen
  };
}