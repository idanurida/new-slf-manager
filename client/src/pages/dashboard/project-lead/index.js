// src/pages/dashboard/project-lead/index.js
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

// Mock data statis
const mockUser = {
  id: 1,
  name: 'Project Lead Mock User',
  role: 'project_lead',
  email: 'project.lead@example.com'
};

const mockStats = {
  totalProjects: 12,
  activeProjects: 8,
  completedProjects: 3,
  overdueProjects: 1
};

const mockProjects = [
  {
    id: 1,
    name: 'Project Alpha',
    client: 'Client A',
    progress: 75,
    status: 'active',
    deadline: '2023-07-15'
  },
  {
    id: 2,
    name: 'Project Beta',
    client: 'Client B',
    progress: 45,
    status: 'active',
    deadline: '2023-08-20'
  },
  {
    id: 3,
    name: 'Project Gamma',
    client: 'Client C',
    progress: 100,
    status: 'completed',
    deadline: '2023-05-30'
  }
];

const ProjectLeadDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleViewProject = (projectId) => {
    router.push(`/dashboard/project-lead/projects/${projectId}`);
  };

  const statusColors = {
    active: 'blue',
    completed: 'green',
    pending: 'yellow',
    overdue: 'red'
  };

  // Tidak perlu useEffect karena semua data sudah statis

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
        <Heading mb={6} color="blue.600">Project Lead Dashboard</Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <StatCard label="Total Projects" value={mockStats.totalProjects} />
          <StatCard label="Active Projects" value={mockStats.activeProjects} />
          <StatCard label="Completed Projects" value={mockStats.completedProjects} />
          <StatCard label="Overdue Projects" value={mockStats.overdueProjects} />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Assigned Projects</Heading>
              {mockProjects.length > 0 ? (
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Project</Th>
                        <Th>Client</Th>
                        <Th>Progress</Th>
                        <Th>Status</Th>
                        <Th>Deadline</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {mockProjects.map(project => (
                        <Tr key={project.id}>
                          <Td>
                            <Text fontWeight="bold">{project.name}</Text>
                          </Td>
                          <Td>{project.client}</Td>
                          <Td>{project.progress}%</Td>
                          <Td>
                            <Badge colorScheme={statusColors[project.status]}>
                              {project.status}
                            </Badge>
                          </Td>
                          <Td>{project.deadline}</Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleViewProject(project.id)}
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
                <Text>No assigned projects</Text>
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

export default ProjectLeadDashboard;

export async function getStaticProps() {
  return {
    props: {} // Kosongkan karena semua data di-mock di komponen
  };
}