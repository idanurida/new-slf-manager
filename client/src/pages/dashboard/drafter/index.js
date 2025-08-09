// src/pages/dashboard/drafter/index.js
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
  useToast,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import TodoList from '../../../components/dashboard/TodoList';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

// ✅ mock services untuk development (Syntax DIPERBAIKI)
const mockAuthService = {
  getMe: () => Promise.resolve({
    // Hapus { tambahan di sini
    id: 1,
    name: 'Drafter Mock User',
    role: 'drafter',
    email: 'drafter@example.com'
  })
};

const mockReportService = {
  getStats: () => Promise.resolve({
    // Hapus { tambahan di sini
    totalReports: 12,
    pendingDrafts: 4,
    completedReports: 8,
    thisWeekDrafts: 2
  }),
  // ✅ Bagian ini sudah benar karena mengembalikan array
  getReportsToDraft: () => Promise.resolve([
    { id: 1, projectName: 'Project Mock A', type: 'Site Report', status: 'pending', dueDate: '2023-06-15' },
    { id: 2, projectName: 'Project Mock B', type: 'Progress Report', status: 'in_progress', dueDate: '2023-06-20' }
  ])
};

// ✅ komponen stat card sederhana (dipindah ke luar fungsi DrafterDashboard)
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

const DrafterDashboard = () => {
  const router = useRouter();

  // ✅ pakai mock services
  const {  user, isLoading: userLoading } = useQuery('user', mockAuthService.getMe);
  const {  stats, isLoading: statsLoading } = useQuery('drafterStats', mockReportService.getStats);
  const {  reportsToDraft, isLoading: reportsLoading } = useQuery('reportsToDraft', mockReportService.getReportsToDraft);

  const loading = userLoading || statsLoading || reportsLoading;

  const handleViewReport = (reportId) => {
    router.push(`/dashboard/drafter/reports/${reportId}`);
  };

  const statusColors = {
    pending: 'yellow',
    in_progress: 'blue',
    completed: 'green',
    overdue: 'red'
  };

  // ✅ loading state untuk mock
  if (loading) {
    return (
      <DashboardLayout user={{ name: 'Loading...', role: 'drafter' }}>
        <Box p={6}>
          <Skeleton height="40px" width="200px" mb={6} />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            {[1,2,3,4].map(i => (
              <Card key={i}>
                <CardBody>
                  <SkeletonText mt="4" noOfLines={3} spacing="4" />
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Card><CardBody><SkeletonText noOfLines={8} /></CardBody></Card>
            <Card><CardBody><SkeletonText noOfLines={8} /></CardBody></Card>
          </SimpleGrid>
        </Box>
      </DashboardLayout>
    );
  }

  // ✅ Return statement yang benar dan lengkap
  return (
    <DashboardLayout user={user}> {/* ✅ Akses langsung user, bukan user?.data */}
      <Box p={6}>
        <Heading mb={6} color="blue.600">Drafter Dashboard</Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {/* ✅ Stat Cards dengan mock data (Akses diperbaiki) */}
          <StatCard label="Total Reports" value={stats?.totalReports || 0} /> {/* ✅ Akses stats.totalReports */}
          <StatCard label="Pending Drafts" value={stats?.pendingDrafts || 0} /> {/* ✅ Akses stats.pendingDrafts */}
          <StatCard label="Completed Reports" value={stats?.completedReports || 0} /> {/* ✅ Akses stats.completedReports */}
          <StatCard label="This Week Drafts" value={stats?.thisWeekDrafts || 0} /> {/* ✅ Akses stats.thisWeekDrafts */}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Reports Needing Drafting</Heading>
              {/* ✅ Akses langsung array reportsToDraft, bukan reportsToDraft?.data */}
              {reportsToDraft?.length > 0 ? (
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Project</Th>
                        <Th>Type</Th>
                        <Th>Status</Th>
                        <Th>Due Date</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {/* ✅ Map langsung array reportsToDraft */}
                      {reportsToDraft.map(report => (
                        <Tr key={report.id}>
                          <Td>{report.projectName}</Td>
                          <Td>{report.type}</Td>
                          <Td>
                            <Badge colorScheme={statusColors[report.status]}>
                              {report.status.replace('_', ' ')}
                            </Badge>
                          </Td>
                          <Td>{report.dueDate}</Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleViewReport(report.id)}
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
                <Text>No reports needing drafting</Text>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              {/* ✅ Akses langsung role, bukan user?.data?.role */}
              <TodoList userRole={user?.role} />
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  );
};

export default DrafterDashboard;

// ✅ INI YANG PENTING: tambahkan di paling bawah
export async function getStaticProps() {
  return {
    props: {} // props kosong untuk mockup
  };
}