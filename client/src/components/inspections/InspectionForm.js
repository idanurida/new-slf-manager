// client/src/components/inspections/InspectionForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  HStack,
  useToast,
  Skeleton,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Textarea,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  Stack,
  Checkbox,
  CheckboxGroup,
  FormErrorMessage // Tambahkan ini
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
// Hapus import axios
// import axios from 'axios';
import { useRouter } from 'next/router';

// Mock data untuk pengguna
const mockUsers = [
  { id: 1, name: 'Inspector A', email: 'inspectorA@example.com', role: 'inspector' },
  { id: 2, name: 'Inspector B', email: 'inspectorB@example.com', role: 'inspector' },
  { id: 3, name: 'Drafter X', email: 'drafterX@example.com', role: 'drafter' },
  { id: 4, name: 'Drafter Y', email: 'drafterY@example.com', role: 'drafter' },
  // Tambahkan lebih banyak mock user jika diperlukan
];

const InspectionForm = ({ inspection, projectId, onSave, isEditing = false }) => {
  const [formData, setFormData] = useState({
    scheduled_date: '',
    inspector_id: '',
    drafter_id: '',
    notes: '',
    status: 'scheduled',
    ...inspection
  });
  
  // Gunakan mockUsers langsung, tidak perlu state untuk users dan fetchingUsers
  // const [users, setUsers] = useState([]);
  // const [fetchingUsers, setFetchingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const router = useRouter();

  // Hilangkan useEffect untuk fetchUsers karena kita menggunakan mock data
  /*
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setFetchingUsers(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUsers(response.data.users || response.data);
      } catch (error) {
        console.error('Fetch users error:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat daftar pengguna',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [toast]);
  */

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle number input changes (tidak digunakan dalam form ini, tapi tetap disertakan untuk konsistensi)
  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'Tanggal jadwal wajib diisi';
    }
    
    if (!formData.inspector_id) {
      newErrors.inspector_id = 'Inspektor wajib dipilih';
    }
    
    if (!formData.drafter_id) {
      newErrors.drafter_id = 'Drafter wajib dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (Mock)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Form Tidak Valid',
        description: 'Silakan perbaiki kesalahan pada form',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buat objek data yang akan dikembalikan (simulasi response API)
      const responseData = {
        ...formData,
        id: inspection?.id || Math.floor(Math.random() * 10000), // Gunakan ID yang ada atau buat mock ID
        project_id: projectId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (isEditing && inspection?.id) {
        toast({
          title: 'Berhasil',
          description: 'Data inspeksi berhasil diperbarui (Mock)',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      } else {
        toast({
          title: 'Berhasil',
          description: 'Inspeksi baru berhasil dibuat (Mock)',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      }
      
      // Call onSave callback if provided
      if (onSave) {
        // Simulate API response structure
        onSave({ data: responseData });
      }
      
      // Redirect to inspection detail page (Mock)
      // Kita tidak bisa melakukan redirect nyata karena ini mock, tapi kita bisa menggunakan router.push
      // untuk simulasi. Pastikan projectId tersedia.
      if (responseData.id && projectId) {
        router.push(`/dashboard/projects/${projectId}/inspections/${responseData.id}`);
      }
      
    } catch (error) {
      console.error('Inspection form error (Mock):', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data inspeksi (Mock)',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get filtered users by role (dari mock data)
  const getUsersByRole = (role) => {
    return mockUsers.filter(user => user.role === role);
  };

  // Get inspection status options
  const getStatusOptions = () => {
    return [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ];
  };

  // Karena kita tidak lagi fetching users, kita tidak perlu tampilan loading untuk itu
  // Tapi kita bisa tetap menunjukkan bahwa komponen sedang memuat saat submit
  // if (fetchingUsers) {
  //   // ... (kode skeleton)
  // }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        as={motion.div}
        whileHover={{ boxShadow: 'lg' }}
        transition={{ duration: 0.2 }}
        variant="outline"
        borderRadius="lg"
      >
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" color="blue.600">
                {isEditing ? 'Edit Inspeksi' : 'Jadwalkan Inspeksi Baru'} (Mock Mode)
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {isEditing 
                  ? 'Perbarui informasi inspeksi (Mock)' 
                  : 'Buat jadwal inspeksi baru untuk proyek (Mock)'}
              </Text>
            </Box>
            
            <Divider />
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Schedule Information */}
                <Box>
                  <Heading size="sm" mb={4} color="gray.700">
                    Informasi Jadwal Inspeksi (Mock)
                  </Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.scheduled_date}>
                        <FormLabel>Tanggal Jadwal (Mock)</FormLabel>
                        <Input
                          type="date"
                          name="scheduled_date"
                          value={formData.scheduled_date}
                          onChange={handleChange}
                          isDisabled={loading}
                        />
                        {errors.scheduled_date && <FormErrorMessage>{errors.scheduled_date}</FormErrorMessage>}
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.status}>
                        <FormLabel>Status (Mock)</FormLabel>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          isDisabled={loading}
                        >
                          {getStatusOptions().map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        {errors.status && <FormErrorMessage>{errors.status}</FormErrorMessage>}
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
                
                <Divider />
                
                {/* Team Assignment */}
                <Box>
                  <Heading size="sm" mb={4} color="gray.700">
                    Penugasan Tim (Mock)
                  </Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.inspector_id}>
                        <FormLabel>Inspektor (Mock)</FormLabel>
                        <Select
                          name="inspector_id"
                          value={formData.inspector_id}
                          onChange={handleChange}
                          placeholder="Pilih Inspektor (Mock)"
                          isDisabled={loading}
                        >
                          {getUsersByRole('inspector').map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </Select>
                        {errors.inspector_id && <FormErrorMessage>{errors.inspector_id}</FormErrorMessage>}
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.drafter_id}>
                        <FormLabel>Drafter (Mock)</FormLabel>
                        <Select
                          name="drafter_id"
                          value={formData.drafter_id}
                          onChange={handleChange}
                          placeholder="Pilih Drafter (Mock)"
                          isDisabled={loading}
                        >
                          {getUsersByRole('drafter').map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </Select>
                        {errors.drafter_id && <FormErrorMessage>{errors.drafter_id}</FormErrorMessage>}
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
                
                <Divider />
                
                {/* Notes */}
                <Box>
                  <Heading size="sm" mb={4} color="gray.700">
                    Catatan Tambahan (Mock)
                  </Heading>
                  
                  <FormControl isInvalid={!!errors.notes}>
                    <FormLabel>Catatan (Mock)</FormLabel>
                    <Textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Masukkan catatan tambahan untuk inspeksi... (Mock)"
                      minHeight="100px"
                      isDisabled={loading}
                    />
                    {errors.notes && <FormErrorMessage>{errors.notes}</FormErrorMessage>}
                  </FormControl>
                </Box>
                
                {/* Action Buttons */}
                <HStack justify="flex-end" spacing={4} pt={2}>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/projects/${projectId}/inspections`)}
                    isDisabled={loading}
                  >
                    Batal (Mock)
                  </Button>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={loading}
                    loadingText={isEditing ? "Memperbarui... (Mock)" : "Menjadwalkan... (Mock)"}
                  >
                    {isEditing ? "Perbarui Inspeksi (Mock)" : "Jadwalkan Inspeksi (Mock)"}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default InspectionForm;