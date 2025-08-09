// src/pages/dashboard/projects/new.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  VStack
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useRouter } from 'next/router';

// Mock data statis untuk testing frontend
const mockUser = {
  id: 1,
  name: 'Project Lead Mock User',
  role: 'project_lead',
  email: 'project.lead@example.com'
};

const NewProjectPage = () => {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    address: '',
    building_function: '',
    floors: '',
    height: '',
    area: '',
    location: '',
    coordinates: '',
    request_type: 'baru'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.name || !formData.owner_name || !formData.address) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }
    
    // Mock submit project
    console.log('Submitting new project:', formData);
    
    toast({
      title: 'Project Created',
      description: 'New project has been created successfully (mock)',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right'
    });
    
    // Redirect to projects list
    setTimeout(() => {
      router.push('/dashboard/projects');
    }, 1500);
  };

  const handleCancel = () => {
    router.push('/dashboard/projects');
  };

  return (
    <DashboardLayout user={mockUser}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">Create New Project</Heading>
        
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Project Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter project name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Owner Name</FormLabel>
                  <Input
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleChange}
                    placeholder="Enter owner name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Address</FormLabel>
                  <Textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter project address"
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Building Function</FormLabel>
                  <Select
                    name="building_function"
                    value={formData.building_function}
                    onChange={handleChange}
                    placeholder="Select building function"
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Mixed">Mixed Use</option>
                    <option value="Government">Government</option>
                  </Select>
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Floors</FormLabel>
                    <Input
                      name="floors"
                      type="number"
                      value={formData.floors}
                      onChange={handleChange}
                      placeholder="Number of floors"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Height (meters)</FormLabel>
                    <Input
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="Building height"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Area (m²)</FormLabel>
                    <Input
                      name="area"
                      type="number"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="Building area"
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City/Region"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Coordinates</FormLabel>
                  <Input
                    name="coordinates"
                    value={formData.coordinates}
                    onChange={handleChange}
                    placeholder="Latitude, Longitude"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Request Type</FormLabel>
                  <Select
                    name="request_type"
                    value={formData.request_type}
                    onChange={handleChange}
                  >
                    <option value="baru">Baru (New)</option>
                    <option value="perpanjangan_slf">Perpanjangan SLF</option>
                    <option value="perubahan_fungsi">Perubahan Fungsi</option>
                  </Select>
                </FormControl>

                <HStack justify="flex-end" spacing={4} mt={4}>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    isDisabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    type="submit"
                    isLoading={loading}
                    loadingText="Creating..."
                  >
                    Create Project
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default NewProjectPage;

export async function getStaticProps() {
  return {
    props: {} // Kosongkan karena semua data di-mock di komponen
  };
}