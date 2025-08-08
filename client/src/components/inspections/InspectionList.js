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
import axios from 'axios';
import { useRouter } from 'next/router';

const InspectionList = ({ projectId }) => {
  const [user, setUser] = useState({});
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch user data
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

  // Fetch inspections data
  useEffect(() => {
    const fetchInspections = async () => {
      if (!projectId || !token) return;
      
      try {
        setLoading(true);
        
        const res = await axios.get(`/api/projects/${projectId}/inspections`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setInspections(res.data);
      } catch (err) {
        console.error('Error fetching inspections:', err);
        toast({
          title: 'Error',
          description: 'Gagal memuat data inspeksi',
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
  }, [projectId, token, toast]);

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
                Daftar Inspeksi
              </Heading>
              <Button 
                colorScheme="green" 
                onClick={handleScheduleInspection}
                size="lg"
              >
                Jadwalkan Inspeksi Baru
              </Button>
            </HStack>
            <Text fontSize="md" color="gray.600" mt={2}>
              Proyek: {projectId ? `ID ${projectId}` : 'Semua Proyek'}
            </Text>
          </Box>

          {/* Filters */}
          <Card>
            <CardBody>
              <HStack spacing={4} wrap="wrap">
                <Input
                  placeholder="Cari ID atau nama inspektor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  width={{ base: '100%', md: '300px' }}
                />
                
                <Select
                  placeholder="Filter berdasarkan status"
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
                    Reset Filter
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
                      <Th>ID</Th>
                      <Th>Tanggal Jadwal</Th>
                      <Th>Inspektor</Th>
                      <Th>Drafter</Th>
                      <Th>Status</Th>
                      <Th>Aksi</Th>
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
                              Lihat Detail
                            </Button>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={6} textAlign="center">
                          <Text color="gray.500">
                            {searchTerm || statusFilter 
                              ? 'Tidak ada inspeksi yang cocok dengan filter' 
                              : 'Belum ada inspeksi yang dijadwalkan'}
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
