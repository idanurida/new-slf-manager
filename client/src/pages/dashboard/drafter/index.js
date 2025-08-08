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
  useToast
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import TodoList from '../../../components/dashboard/TodoList';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { authService, reportService } from 'services/api';

const DrafterDashboard = () => {
  const router = useRouter();

  const { data: user, isLoading: userLoading } = useQuery('user', authService.getMe);
  const { data: stats, isLoading: statsLoading } = useQuery('drafterStats', reportService.getStats); // Placeholder
  const { data: reportsToDraft, isLoading: reportsLoading } = useQuery('reportsToDraft', reportService.getReportsToDraft); // Placeholder

  const loading = userLoading || statsLoading || reportsLoading;

  const handleViewReport = (reportId) => {
    router.push(`/dashboard/drafter/reports/${reportId}`);
  };

  const statusColors = {
    // ... status colors
  };

  return (
    <DashboardLayout user={user?.data}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">Drafter Dashboard</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {/* ... Stat Cards ... */}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Reports Needing Drafting</Heading>
              {/* ... Reports Table ... */}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <TodoList userRole={user?.data?.role} />
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  );
};

export default DrafterDashboard;
