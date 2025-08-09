import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import TodoList from '../../../components/dashboard/TodoList';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

// ✅ mock services untuk development
const mockAuthService = {
  getMe: () => Promise.resolve({ 
    data: { 
      id: 1, 
      name: 'Superadmin Mock User', 
      role: 'superadmin',
      email: 'superadmin@example.com'
    } 
  })
};

const mockAdminService = {
  getStats: () => Promise.resolve({ 
    data: {
      totalUsers: 45,
      totalProjects: 28,
      activeProjects: 15,
      pendingApprovals: 3
    } 
  })
};

const mockProjectService = {
  getUsers: () => Promise.resolve({ 
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'project_lead', status: 'active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'client', status: 'active' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'inspector', status: 'inactive' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'drafter', status: 'active' },
      { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'admin_lead', status: 'active' }
    ] 
  }),
  
  getAllProjects: () => Promise.resolve({ 
    data: [
      { id: 1, name: 'Project Alpha', owner: 'Client A', status: 'inspection_in_progress', progress: 75 },
      { id: 2, name: 'Project Beta', owner: 'Client B', status: 'quotation_accepted', progress: 30 },
      { id: 3, name: 'Project Gamma', owner: 'Client C', status: 'slf_issued', progress: 100 },
      { id: 4, name: 'Project Delta', owner: 'Client D', status: 'draft', progress: 10 },
      { id: 5, name: 'Project Epsilon', owner: 'Client E', status: 'contract_signed', progress: 50 }
    ] 
  })
};

const SuperadminDashboard = () => {
  const router = useRouter();

  // ✅ pakai mock services dengan format v5
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => mockAuthService.getMe().then(res => res.data).catch(() => null)
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => mockAdminService.getStats().then(res => res.data)
  });

  const { data: recentUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: () => mockProjectService.getUsers().then(res => res.data)
  });

  const { data: recentProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['recentProjects'],
    queryFn: () => mockProjectService.getAllProjects().then(res => res.data)
  });

  const loading = userLoading || statsLoading || usersLoading || projectsLoading;

  const statusColors = {
    active: 'green',
    inactive: 'red',
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

  // ✅ loading state untuk mock
  if (loading) {
    return (
      <DashboardLayout user={{}}>
        <Box p={6}>
          <VStack spacing={6} align="stretch">
            <Skeleton height="40px" width="250px" />
            
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card><CardBody><SkeletonText noOfLines={8} /></CardBody></Card>
              <Card><CardBody><SkeletonText noOfLines={8} /></CardBody></Card>
            </SimpleGrid>

            <Card>
              <CardBody>
                <Skeleton height="30px" width="200px" mb={4} />
                <VStack spacing={3}>
                  {[1,2,3,4,5].map(i => (
                    <Skeleton key={i} height="50px" width="100%" />
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <Box p={6}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <Heading color="blue.600">Superadmin Dashboard</Heading>
            </HStack>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <StatCard label="Total Users" value={stats?.totalUsers || 0} />
              <StatCard label="Total Projects" value={stats?.totalProjects || 0} />
              <StatCard label="Active Projects" value={stats?.activeProjects || 0} />
              <StatCard label="Pending Approvals" value={stats?.pendingApprovals || 0} />
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card>
                <CardBody>
                  <TodoList userRole={user?.role} />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>System Notifications</Heading>
                  <Text>Notifications will be shown here.</Text>
                  <Box mt={4} p={3} bg="blue.50" borderRadius="md">
                    <Text fontSize="sm" color="blue.700">
                      Mock notification: System is running normally
                    </Text>
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Tabs variant="soft-rounded" colorScheme="blue">
              <TabList mb={6}>
                <Tab>Users Management</Tab>
                <Tab>Projects Overview</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Card>
                    <CardBody>
                      <Heading size="md" mb={4}>Recent Users</Heading>
                      {recentUsers?.length > 0 ? (
                        <TableContainer>
                          <Table variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Name</Th>
                                <Th>Email</Th>
                                <Th>Role</Th>
                                <Th>Status</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {recentUsers.map(user => (
                                <Tr key={user.id}>
                                  <Td>
                                    <Text fontWeight="bold">{user.name}</Text>
                                  </Td>
                                  <Td>{user.email}</Td>
                                  <Td>
                                    <Badge colorScheme="blue">
                                      {user.role.replace(/_/g, ' ')}
                                    </Badge>
                                  </Td>
                                  <Td>
                                    <Badge colorScheme={statusColors[user.status] || 'gray'}>
                                      {user.status}
                                    </Badge>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Text>No users found</Text>
                      )}
                    </CardBody>
                  </Card>
                </TabPanel>
                <TabPanel>
                  <Card>
                    <CardBody>
                      <Heading size="md" mb={4}>Recent Projects</Heading>
                      {recentProjects?.length > 0 ? (
                        <TableContainer>
                          <Table variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Project Name</Th>
                                <Th>Owner</Th>
                                <Th>Status</Th>
                                <Th>Progress</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {recentProjects.map(project => (
                                <Tr key={project.id}>
                                  <Td>
                                    <Text fontWeight="bold">{project.name}</Text>
                                  </Td>
                                  <Td>{project.owner}</Td>
                                  <Td>
                                    <Badge colorScheme={statusColors[project.status] || 'gray'}>
                                      {project.status.replace(/_/g, ' ')}
                                    </Badge>
                                  </Td>
                                  <Td>{project.progress}%</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Text>No projects found</Text>
                      )}
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </motion.div>
      </Box>
    </DashboardLayout>
  );
};

// ✅ komponen stat card sederhana
const StatCard = ({ label, value }) => (
  <Card>
    <CardBody>
      <Text fontWeight="medium" color="gray.600">{label}</Text>
      <Text fontSize="2xl" fontWeight="bold" color="blue.600">{value}</Text>
    </CardBody>
  </Card>
);

export default SuperadminDashboard;

// ✅ INI YANG PENTING: tambahkan di paling bawah
export async function getStaticProps() {
  return {
    props: {} // props kosong untuk mockup
  };
}