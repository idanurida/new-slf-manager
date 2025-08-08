// client/src/pages/dashboard/head-consultant/index.js
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
  useToast,
  Skeleton
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../../components/layouts/DashboardLayout';

const HeadConsultantDashboard = () => {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    totalProjects: 0,
    onProgress: 0,
    completed: 0,
    pendingApprovals: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        // Fetch user data
        const userRes = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userRes.data.user);

        // Fetch stats
        const statsRes = await axios.get('/api/head-consultant/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        // Fetch pending approvals
        const approvalsRes = await axios.get('/api/head-consultant/pending-approvals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingApprovals(approvalsRes.data);

      } catch (error) {
        console.error('Dashboard error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const handleViewApproval = (approvalId) => {
    window.location.href = `/dashboard/head-consultant/approvals/${approvalId}`;
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <Box p={6}>
          <Skeleton height="40px" width="250px" mb={6} />
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="100px" borderRadius="md" />
            ))}
          </SimpleGrid>
          <Card>
            <CardBody>
              <Skeleton height="30px" width="200px" mb={4} />
              <VStack spacing={3}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} height="50px" width="100%" />
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">Head Consultant Dashboard</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Projects</StatLabel>
                <StatNumber color="blue.500">{stats.totalProjects}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>On Progress</StatLabel>
                <StatNumber color="orange.500">{stats.onProgress}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Completed</StatLabel>
                <StatNumber color="green.500">{stats.completed}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pending Approvals</StatLabel>
                <StatNumber color="red.500">{stats.pendingApprovals}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Pending Approvals</Heading>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Project Name</Th>
                    <Th>Submitted By</Th>
                    <Th>Date Submitted</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingApprovals.length > 0 ? (
                    pendingApprovals.map((approval) => (
                      <Tr key={approval.id}>
                        <Td>
                          <Text fontWeight="bold">{approval.project?.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {approval.project?.owner_name}
                          </Text>
                        </Td>
                        <Td>{approval.submitted_by?.name}</Td>
                        <Td>{new Date(approval.submitted_at).toLocaleDateString('id-ID')}</Td>
                        <Td>
                          <Badge colorScheme="orange">Pending</Badge>
                        </Td>
                        <Td>
                          <Button 
                            size="sm" 
                            colorScheme="blue"
                            onClick={() => handleViewApproval(approval.id)}
                          >
                            Review
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={5} textAlign="center">
                        <Text color="gray.500">No pending approvals</Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default HeadConsultantDashboard;
