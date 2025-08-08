// client/src/components/projects/ProjectForm.js
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
  Textarea,
  Select,
  Button,
  VStack,
  HStack,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';

const ProjectForm = ({ project, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    address: '',
    building_function: '',
    floors: 1,
    height: '',
    area: '',
    location: '',
    coordinates: '',
    request_type: 'baru',
    project_lead_id: '',
    client_id: '',
    ...project // Jika ada data proyek yang sudah ada
  });
  
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const router = useRouter();

  // Fetch users for dropdowns
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUsers(response.data.users || response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat daftar pengguna',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
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
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Nama proyek wajib diisi';
    }
    
    if (!formData.owner_name?.trim()) {
      newErrors.owner_name = 'Nama pemilik wajib diisi';
    }
    
    if (!formData.address?.trim()) {
      newErrors.address = 'Alamat proyek wajib diisi';
    }
    
    if (!formData.building_function?.trim()) {
      newErrors.building_function = 'Fungsi bangunan wajib diisi';
    }
    
    if (!formData.floors || formData.floors < 1) {
      newErrors.floors = 'Jumlah lantai minimal 1';
    }
    
    if (!formData.request_type) {
      newErrors.request_type = 'Jenis permohonan wajib dipilih';
    }
    
    if (!formData.project_lead_id) {
      newErrors.project_lead_id = 'Project Lead wajib dipilih';
    }
    
    if (!formData.client_id) {
      newErrors.client_id = 'Klien wajib dipilih';
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
      
      if (isEditing && project?.id) {
        // Update existing project
        response = await axios.put(`/api/projects/${project.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast({
          title: 'Berhasil',
          description: 'Data proyek berhasil diperbarui',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      } else {
        // Create new project
        response = await axios.post('/api/projects', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast({
          title: 'Berhasil',
          description: 'Proyek baru berhasil dibuat',
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
      
      // Redirect to project detail page
      if (response.data.id) {
        router.push(`/dashboard/projects/${response.data.id}`);
      }
      
    } catch (error) {
      console.error('Project form error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal menyimpan data proyek',
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

  // Get building function options
  const getBuildingFunctionOptions = () => {
    return [
      'Rumah Tinggal',
      'Gedung Kantor',
      'Mall/Perbelanjaan',
      'Rumah Sakit',
      'Sekolah',
      'Hotel',
      'Apartemen',
      'Industri',
      'Gudang',
      'Terminal',
      'Bandara',
      'Pelabuhan',
      'Tempat Ibadah',
      'Tempat Rekreasi',
      'Fasilitas Umum',
      'Lainnya'
    ];
  };

  // Get request type options
  const getRequestTypeOptions = () => {
    return [
      { value: 'baru', label: 'SLF Baru' },
      { value: 'perpanjangan_slf', label: 'Perpanjangan SLF' },
      { value: 'perubahan_fungsi', label: 'Perubahan Fungsi' },
      { value: 'pascabencana', label: 'Pasca Bencana' }
    ];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="lg" color="blue.600">
                {isEditing ? 'Edit Proyek' : 'Buat Proyek Baru'}
              </Heading>
              <Text color="gray.500">
                {isEditing 
                  ? 'Perbarui informasi proyek' 
                  : 'Buat proyek baru untuk permohonan SLF'}
              </Text>
            </Box>
            
            <Divider />
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information Section */}
                <Box>
                  <Heading size="md" mb={4} color="gray.700">
                    Informasi Dasar Proyek
                  </Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.name}>
                        <FormLabel>Nama Proyek</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Masukkan nama proyek"
                          isDisabled={loading}
                        />
                        <FormErrorMessage>{errors.name}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.owner_name}>
                        <FormLabel>Nama Pemilik</FormLabel>
                        <Input
                          name="owner_name"
                          value={formData.owner_name}
                          onChange={handleChange}
                          placeholder="Masukkan nama pemilik"
                          isDisabled={loading}
                        />
                        <FormErrorMessage>{errors.owner_name}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={2}>
                      <FormControl isRequired isInvalid={!!errors.address}>
                        <FormLabel>Alamat Proyek</FormLabel>
                        <Textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Masukkan alamat lengkap proyek"
                          minHeight="100px"
                          isDisabled={loading}
                        />
                        <FormErrorMessage>{errors.address}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
                
                <Divider />
                
                {/* Building Specifications Section */}
                <Box>
                  <Heading size="md" mb={4} color="gray.700">
                    Spesifikasi Bangunan
                  </Heading>
                  
                  <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                    <GridItem colSpan={{ base: 4, md: 2 }}>
                      <FormControl isRequired isInvalid={!!errors.building_function}>
                        <FormLabel>Fungsi Bangunan</FormLabel>
                        <Select
                          name="building_function"
                          value={formData.building_function}
                          onChange={handleChange}
                          placeholder="Pilih fungsi bangunan"
                          isDisabled={loading}
                        >
                          {getBuildingFunctionOptions().map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.building_function}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={{ base: 4, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.floors}>
                        <FormLabel>Jumlah Lantai</FormLabel>
                        <NumberInput
                          name="floors"
                          value={formData.floors}
                          onChange={(value) => handleNumberChange('floors', parseInt(value) || 1)}
                          min={1}
                          max={100}
                          isDisabled={loading}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <FormErrorMessage>{errors.floors}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={{ base: 4, md: 1 }}>
                      <FormControl isInvalid={!!errors.height}>
                        <FormLabel>Tinggi Bangunan (meter)</FormLabel>
                        <NumberInput
                          name="height"
                          value={formData.height || ''}
                          onChange={(value) => handleNumberChange('height', parseFloat(value) || '')}
                          min={0}
                          precision={2}
                          isDisabled={loading}
                        >
                          <NumberInputField placeholder="0.00" />
                        </NumberInput>
                        <FormErrorMessage>{errors.height}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={{ base: 4, md: 2 }}>
                      <FormControl isInvalid={!!errors.area}>
                        <FormLabel>Luas Bangunan (m²)</FormLabel>
                        <NumberInput
                          name="area"
                          value={formData.area || ''}
                          onChange={(value) => handleNumberChange('area', parseFloat(value) || '')}
                          min={0}
                          precision={2}
                          isDisabled={loading}
                        >
                          <NumberInputField placeholder="0.00" />
                        </NumberInput>
                        <FormErrorMessage>{errors.area}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={{ base: 4, md: 2 }}>
                      <FormControl isInvalid={!!errors.location}>
                        <FormLabel>Lokasi</FormLabel>
                        <Input
                          name="location"
                          value={formData.location || ''}
                          onChange={handleChange}
                          placeholder="Masukkan lokasi proyek"
                          isDisabled={loading}
                        />
                        <FormErrorMessage>{errors.location}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={4}>
                      <FormControl isInvalid={!!errors.coordinates}>
                        <FormLabel>Koordinat GPS</FormLabel>
                        <Input
                          name="coordinates"
                          value={formData.coordinates || ''}
                          onChange={handleChange}
                          placeholder="Contoh: -6.123456, 106.789012"
                          isDisabled={loading}
                        />
                        <FormErrorMessage>{errors.coordinates}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
                
                <Divider />
                
                {/* Request Type Section */}
                <Box>
                  <Heading size="md" mb={4} color="gray.700">
                    Jenis Permohonan SLF
                  </Heading>
                  
                  <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    <GridItem colSpan={{ base: 3, md: 2 }}>
                      <FormControl isRequired isInvalid={!!errors.request_type}>
                        <FormLabel>Jenis Permohonan</FormLabel>
                        <Select
                          name="request_type"
                          value={formData.request_type}
                          onChange={handleChange}
                          isDisabled={loading}
                        >
                          {getRequestTypeOptions().map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.request_type}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
                
                <Divider />
                
                {/* Team Assignment Section */}
                <Box>
                  <Heading size="md" mb={4} color="gray.700">
                    Penugasan Tim
                  </Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.project_lead_id}>
                        <FormLabel>Project Lead</FormLabel>
                        <Select
                          name="project_lead_id"
                          value={formData.project_lead_id}
                          onChange={handleChange}
                          placeholder="Pilih Project Lead"
                          isDisabled={loading}
                        >
                          {getUsersByRole('project_lead').map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.project_lead_id}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem colSpan={{ base: 2, md: 1 }}>
                      <FormControl isRequired isInvalid={!!errors.client_id}>
                        <FormLabel>Klien</FormLabel>
                        <Select
                          name="client_id"
                          value={formData.client_id}
                          onChange={handleChange}
                          placeholder="Pilih Klien"
                          isDisabled={loading}
                        >
                          {getUsersByRole('klien').map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.client_id}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
                
                {/* Action Buttons */}
                <HStack justify="flex-end" spacing={4} pt={4}>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    isDisabled={loading}
                  >
                    Batal
                  </Button>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={loading}
                    loadingText={isEditing ? "Memperbarui..." : "Membuat..."}
                  >
                    {isEditing ? "Perbarui Proyek" : "Buat Proyek"}
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

export default ProjectForm;
