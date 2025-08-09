// client/src/components/inspections/InspectionList.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
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
  Input,
  Select,
  HStack,
  VStack
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
// Hapus import axios
// import axios from 'axios';
import { useRouter } from 'next/router';

// Mock data untuk pengujian frontend
const mockUser = {
  id: 1,
  name: 'Inspector Mock User',
  email: 'inspector@mock.com',
  role: 'inspector'
};

const mockInspections = (projectId) => [
  {
    id: 1,
    project_id: projectId || 1,
    scheduled_date: '2023-07-15T10:00:00Z',
    status: 'scheduled',
    inspector: { id: 1, name: 'Inspector A' },
    drafter: { id: 3, name: 'Drafter X' }
  },
  {
    id: 2,
    project_id: projectId || 1,
    scheduled_date: '2023-07-20T14:00:00Z',
    status: 'in_progress',
    inspector: { id: 2, name: 'Inspector B' },
    drafter: { id: 4, name: 'Drafter Y' }
  },
  {
    id: 3,
    project_id: projectId || 1,
    scheduled_date: '2023-06-28T09:00:00Z',
    status: 'completed',
    inspector: { id: 1, name: 'Inspector A' },
    drafter: { id: 3, name: 'Drafter X' }
  },
  {
    id: 4,
    project_id: projectId || 1,
    scheduled_date: '2023-08-05T11:00:00Z',
    status: 'scheduled',
    inspector: { id: 2, name: 'Inspector B' },
    drafter: { id: 4, name: 'Drafter Y' }
  }
];

const InspectionList = ({ projectId }) => {
  const [user, setUser] = useState(mockUser); // Gunakan mock user langsung
  const [inspections, setInspections] = useState([]); // Akan diisi dengan mock data
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();
  const router = useRouter();

  // Hilangkan useEffect untuk fetchUser karena kita menggunakan mock data
  /*
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (err) {
        console.error('Error fetching user:', err);
        toast({
          title: 'Error',
          description: 'Gagal memuat data pengguna',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        router.push('/login');
      }
    };

    fetchUser();
  }, [token, router, toast]);
  */

  // Modifikasi useEffect untuk fetchInspections agar menggunakan mock data
  useEffect(() => {
    // Simulasi loading data
    const fetchInspections = async () => {
      // if (!projectId || !token) return; // Hapus pengecekan token
      if (!projectId) return; // Hanya periksa projectId
      
      try {
        setLoading(true);
        
        // Simulasi delay API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Gunakan mock data
        setInspections(mockInspections(projectId));
        
      } catch (err) {
        console.error('Error fetching inspections (Mock):', err);
        toast({
          title: 'Error',
          description: 'Gagal memuat data inspeksi (Mock)',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, [projectId, toast]); // Hapus token dari dependency array

  const handleViewInspection = (inspectionId) => {
    router.push(`/dashboard/projects/${projectId}/inspections/${inspectionId}`);
  };

  const handleScheduleInspection = () => {
    router.push(`/dashboard/projects/${projectId}/inspections/schedule`);
  };

  const statusColors = {
    scheduled: 'yellow',
    in_progress: 'orange',
    completed: 'green',
    cancelled: 'red'
  };

  // Filter inspections
  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.id.toString().includes(searchTerm) ||
                         (inspection.inspector?.name && inspection.inspector.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter ? inspection.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box p={6}>
        <Skeleton height="40px" width="250px" mb={6} />
        
        <HStack spacing={4} mb={6}>
          <Skeleton height="40px" width="200px" />
          <Skeleton height="40px" width="150px" />
        </HStack>
        
        <Card>
          <CardBody>
            <Skeleton height="30px" width="150px" mb={4} />
            <VStack spacing={3}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="50px" width="100%" />
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box p={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between">
              <Heading color="blue.600">
                Daftar Inspeksi (Mock Mode)
              </Heading>
              <Button 
                colorScheme="green" 
                onClick={handleScheduleInspection}
                size="lg"
              >
                Jadwalkan Inspeksi Baru (Mock)
              </Button>
            </HStack>
            <Text fontSize="md" color="gray.600" mt={2}>
              Proyek: {projectId ? `ID ${projectId} (Mock)` : 'Semua Proyek (Mock)'}
            </Text>
          </Box>

          {/* Filters */}
          <Card>
            <CardBody>
              <HStack spacing={4} wrap="wrap">
                <Input
                  placeholder="Cari ID atau nama inspektor... (Mock)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  width={{ base: '100%', md: '300px' }}
                />
                
                <Select
                  placeholder="Filter berdasarkan status (Mock)"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  width={{ base: '100%', md: '200px' }}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
                
                {(searchTerm || statusFilter) && (
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                    }}
                    variant="outline"
                    colorScheme="red"
                  >
                    Reset Filter (Mock)
                  </Button>
                )}
              </HStack>
            </CardBody>
          </Card>

          {/* Inspections Table */}
          <Card>
            <CardBody>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID (Mock)</Th>
                      <Th>Tanggal Jadwal (Mock)</Th>
                      <Th>Inspektor (Mock)</Th>
                      <Th>Drafter (Mock)</Th>
                      <Th>Status (Mock)</Th>
                      <Th>Aksi (Mock)</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredInspections.length > 0 ? (
                      filteredInspections.map((inspection) => (
                        <Tr key={inspection.id}>
                          <Td>
                            <Text fontWeight="bold">#{inspection.id}</Text>
                          </Td>
                          <Td>
                            {inspection.scheduled_date 
                              ? new Date(inspection.scheduled_date).toLocaleDateString('id-ID')
                              : '-'}
                          </Td>
                          <Td>
                            {inspection.inspector?.name || '-'}
                          </Td>
                          <Td>
                            {inspection.drafter?.name || '-'}
                          </Td>
                          <Td>
                            <Badge colorScheme={statusColors[inspection.status] || 'gray'}>
                              {inspection.status.replace(/_/g, ' ')}
                            </Badge>
                          </Td>
                          <Td>
                            <Button 
                              size="sm" 
                              colorScheme="blue"
                              onClick={() => handleViewInspection(inspection.id)}
                            >
                              Lihat Detail (Mock)
                            </Button>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={6} textAlign="center">
                          <Text color="gray.500">
                            {searchTerm || statusFilter 
                              ? 'Tidak ada inspeksi yang cocok dengan filter (Mock)' 
                              : 'Belum ada inspeksi yang dijadwalkan (Mock)'}
                          </Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </motion.div>
  );
};

export default InspectionList;