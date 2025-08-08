import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
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
  VStack,
  HStack,
  IconButton,
  Tooltip,
  Divider
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import TodoList from '../../../components/dashboard/TodoList';
import { authService, projectService, scheduleService } from 'services/api';
import { useRouter } from 'next/router';

const ClientDashboard = () => {
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery('user', authService.getMe);
  const { data: projectsData, isLoading: projectsLoading } = useQuery('clientProjects', projectService.getAllProjects);
  const { data: schedulesData, isLoading: schedulesLoading } = useQuery('clientPendingSchedules', scheduleService.getClientPendingSchedules);

  const handleApproval = async (scheduleId, approve) => {
    // ... handleApproval logic
  };

  const statusColors = {
    // ... status colors
  };

  return (
    <DashboardLayout user={user?.data}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">Client Dashboard</Heading>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
          <Card variant="outline" borderColor="yellow.400">
            <CardBody>
              <Heading size="md" mb={4} color="gray.700">Pending Schedule Approvals</Heading>
              {/* ... Pending Schedules List ... */}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <TodoList userRole={user?.data?.role} />
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>My Projects</Heading>
            {/* ... My Projects Table ... */}
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default ClientDashboard;
