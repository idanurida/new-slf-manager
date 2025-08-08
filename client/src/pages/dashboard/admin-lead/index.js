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
import { authService, adminService } from 'services/api';

const AdminLeadDashboard = () => {
  const toast = useToast();
  const router = useRouter();

  const { data: user, isLoading: userLoading } = useQuery('user', authService.getMe);
  const { data: stats, isLoading: statsLoading } = useQuery('adminStats', adminService.getStats);
  const { data: pendingPayments, isLoading: paymentsLoading } = useQuery('pendingPayments', adminService.getProjectPayments);

  const loading = userLoading || statsLoading || paymentsLoading;

  const handleViewPayment = (paymentId) => {
    router.push(`/dashboard/admin-lead/payments/${paymentId}`);
  };

  const statusColors = {
    pending: 'yellow',
    verified: 'green',
    rejected: 'red'
  };

  return (
    <DashboardLayout user={user?.data}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">Admin Lead Dashboard</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {/* ... Stat Cards ... */}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card>
            <CardBody>
              <Heading size="md" mb={4} color="gray.700">Pembayaran Menunggu Verifikasi</Heading>
              {/* ... Pending Payments Table ... */}
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

export default AdminLeadDashboard;
