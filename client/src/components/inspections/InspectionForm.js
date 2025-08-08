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
  CheckboxGroup
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';

const InspectionForm = ({ inspection, projectId, onSave, isEditing = false }) => {
  const [formData, setFormData] = useState({
    scheduled_date: '',
    inspector_id: '',
    drafter_id: '',
    notes: '',
    status: 'scheduled',
    ...inspection
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const router = useRouter();

  // Fetch users for dropdowns
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

  // Handle number input changes
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

  // Handle form submission
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
      const token = localStorage.getItem('token');
      let response;
      
      if (isEditing && inspection?.id) {
        // Update existing inspection
        response = await axios.put(`/api/inspections/${inspection.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast({
          title: 'Berhasil',
          description: 'Data inspeksi berhasil diperbarui',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      } else {
        // Create new inspection
        response = await axios.post(`/api/projects/${projectId}/inspections`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast({
          title: 'Berhasil',
          description: 'Inspeksi baru berhasil dibuat',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      }
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(response.data);
      }
      
      // Redirect to inspection detail page
      if (response.data.id) {
        router.push(`/dashboard/projects/${projectId}/inspections/${response.data.id}`);
      }
      
    } catch (error) {
      console.error('Inspection form error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal menyimpan data inspeksi',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get filtered users by role
  const getUsersByRole = (role) => {
    return users.filter(user => user.role === role);
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

  if (fetchingUsers) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Skeleton height="40px" width="200px" />
              <Skeleton height="20px" width="300px" />
              
              <VStack spacing={4} align="stretch">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height="60px" />
                ))}
              </VStack>
              
              <HStack justify="flex-end">
                <Skeleton height="40px" width="100px" />
                <Skeleton height="40px" width="100px" />
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

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
                {isEditing ? 'Edit Inspeksi' : 'Jadwalkan Inspeksi Baru'}
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {isEditing 
                  ? 'Perbarui informasi inspeksi' 
                  : 'Buat jadwal inspeksi baru untuk proyek'}
              </Text>
            </Box>
            
            <Divider />
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Schedule Information */}
                <Box>
                  <Heading size="sm" mb={4} color="gray.700">
                    Informasi Jadwal Inspeksi
                  </Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.scheduled_date}>
                        <FormLabel>Tanggal Jadwal</FormLabel>
                        <Input
                          type="date"
                          name="scheduled_date"
                          value={formData.scheduled_date}
                          onChange={handleChange}
                          isDisabled={loading}
                        />
                        <FormErrorMessage>{errors.scheduled_date}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.status}>
                        <FormLabel>Status</FormLabel>
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
                        <FormErrorMessage>{errors.status}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
                
                <Divider />
                
                {/* Team Assignment */}
                <Box>
                  <Heading size="sm" mb={4} color="gray.700">
                    Penugasan Tim
                  </Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.inspector_id}>
                        <FormLabel>Inspektor</FormLabel>
                        <Select
                          name="inspector_id"
                          value={formData.inspector_id}
                          onChange={handleChange}
                          placeholder="Pilih Inspektor"
                          isDisabled={loading}
                        >
                          {getUsersByRole('inspektor').map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.inspector_id}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.drafter_id}>
                        <FormLabel>Drafter</FormLabel>
                        <Select
                          name="drafter_id"
                          value={formData.drafter_id}
                          onChange={handleChange}
                          placeholder="Pilih Drafter"
                          isDisabled={loading}
                        >
                          {getUsersByRole('drafter').map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.drafter_id}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
                
                <Divider />
                
                {/* Notes */}
                <Box>
                  <Heading size="sm" mb={4} color="gray.700">
                    Catatan Tambahan
                  </Heading>
                  
                  <FormControl isInvalid={!!errors.notes}>
                    <FormLabel>Catatan</FormLabel>
                    <Textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Masukkan catatan tambahan untuk inspeksi..."
                      minHeight="100px"
                      isDisabled={loading}
                    />
                    <FormErrorMessage>{errors.notes}</FormErrorMessage>
                  </FormControl>
                </Box>
                
                {/* Action Buttons */}
                <HStack justify="flex-end" spacing={4} pt={2}>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/projects/${projectId}/inspections`)}
                    isDisabled={loading}
                  >
                    Batal
                  </Button>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={loading}
                    loadingText={isEditing ? "Memperbarui..." : "Menjadwalkan..."}
                  >
                    {isEditing ? "Perbarui Inspeksi" : "Jadwalkan Inspeksi"}
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
