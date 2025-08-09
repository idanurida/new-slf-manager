// src/pages/dashboard/admin-lead/index.js
import React, { useState, useEffect } from 'react';
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
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import TodoList from '../../../components/dashboard/TodoList';
import { useRouter } from 'next/router';

// Mock data statis untuk testing frontend
const mockUser = {
  id: 1,
  name: 'Admin Lead Mock User',
  role: 'admin_lead',
  email: 'admin.lead@example.com'
};

const mockStats = {
  totalProjects: 15,
  pendingPayments: 8,
  pendingDocuments: 12,
  activeUsers: 25
};

const mockPendingPayments = [
  {
    id: 1,
    projectName: 'Project Alpha',
    client: 'PT. Bangun Jaya',
    amount: 5000000,
    dueDate: '2023-06-30',
    status: 'pending'
  },
  {
    id: 2,
    projectName: 'Project Beta',
    client: 'CV. Maju Terus',
    amount: 10000000,
    dueDate: '2023-07-15',
    status: 'pending'
  }
];

const AdminLeadDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleViewPayment = (paymentId) => {
    router.push(`/dashboard/admin-lead/payments/${paymentId}`);
  };

  const statusColors = {
    pending: 'yellow',
    verified: 'green',
    rejected: 'red'
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
        <Heading mb={6} color="blue.600">Admin Lead Dashboard</Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <StatCard label="Total Projects" value={mockStats.totalProjects} />
          <StatCard label="Pending Payments" value={mockStats.pendingPayments} />
          <StatCard label="Pending Documents" value={mockStats.pendingDocuments} />
          <StatCard label="Active Users" value={mockStats.activeUsers} />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Pending Payments</Heading>
              {mockPendingPayments.length > 0 ? (
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Project</Th>
                        <Th>Client</Th>
                        <Th>Amount</Th>
                        <Th>Due Date</Th>
                        <Th>Status</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {mockPendingPayments.map(payment => (
                        <Tr key={payment.id}>
                          <Td>
                            <Text fontWeight="bold">{payment.projectName}</Text>
                          </Td>
                          <Td>{payment.client}</Td>
                          <Td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payment.amount)}</Td>
                          <Td>{new Date(payment.dueDate).toLocaleDateString('id-ID')}</Td>
                          <Td>
                            <Badge colorScheme={statusColors[payment.status]}>
                              {payment.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleViewPayment(payment.id)}
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
                <Text>No pending payments</Text>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <TodoList userRole={mockUser.role} />
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  );
};

export default AdminLeadDashboard;

export async function getStaticProps() {
  return {
    props: {} // Kosongkan karena semua data di-mock di komponen
  };
}