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
  TabPanel
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import TodoList from '../../../components/dashboard/TodoList';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { authService, projectService, adminService } from 'services/api';

const SuperadminDashboard = () => {
  const router = useRouter();

  // v5 format
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => authService.getMe().then(res => res.data).catch(() => null)
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getStats?.().then(res => res.data) ?? []
  });

  const { data: recentUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: () => projectService.getUsers?.({ limit: 5 }).then(res => res.data) ?? []
  });

  const { data: recentProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['recentProjects'],
    queryFn: () => projectService.getAllProjects({ limit: 5 }).then(res => res.data)
  });

  const loading = userLoading || statsLoading || usersLoading || projectsLoading;

  return (
    <DashboardLayout user={user}>
      <Box p={6}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <Heading color="blue.600">Superadmin Dashboard</Heading>
            </HStack>

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
                  {/* Users Table */}
                </TabPanel>
                <TabPanel>
                  {/* Projects Table */}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </motion.div>
      </Box>
    </DashboardLayout>
  );
};

export default SuperadminDashboard;
