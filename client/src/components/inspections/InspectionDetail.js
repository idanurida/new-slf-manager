// client/src/components/inspections/InspectionDetail.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  VStack,
  HStack,
  useToast,
  Skeleton,
  Divider,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';
import DynamicChecklistForm from './DynamicChecklistForm';
import PhotoUpload from './PhotoUpload';
import PhotoGallery from './PhotoGallery';

const InspectionDetail = ({ inspectionId, projectId }) => {
  const [user, setUser] = useState({});
  const [inspection, setInspection] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistResponses, setChecklistResponses] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
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

  // Fetch inspection data
  useEffect(() => {
    const fetchInspectionData = async () => {
      if (!inspectionId || !token) return;
      
      try {
        setLoading(true);
        
        // Fetch inspection details
        const inspectionRes = await axios.get(`/api/inspections/${inspectionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInspection(inspectionRes.data);
        
        // Fetch checklist items
        const itemsRes = await axios.get('/api/checklist-items', {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            category: inspectionRes.data.category || 'tata_bangunan'
          }
        });
        setChecklistItems(itemsRes.data);
        
        // Fetch existing responses
        const responsesRes = await axios.get(`/api/inspections/${inspectionId}/checklist-responses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChecklistResponses(responsesRes.data);
        
        // Fetch photos
        const photosRes = await axios.get(`/api/inspections/${inspectionId}/photos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPhotos(photosRes.data);
        
      } catch (err) {
        console.error('Error fetching inspection data:', err);
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

    fetchInspectionData();
  }, [inspectionId, token, toast]);

  const handleStartInspection = async () => {
    try {
      const response = await axios.put(`/api/inspections/${inspectionId}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setInspection(response.data);
      
      toast({
        title: 'Inspeksi Dimulai',
        description: 'Inspeksi telah dimulai',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Start inspection error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal memulai inspeksi',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const handleCompleteInspection = async () => {
    try {
      const response = await axios.put(`/api/inspections/${inspectionId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setInspection(response.data);
      
      toast({
        title: 'Inspeksi Selesai',
        description: 'Inspeksi telah diselesaikan',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Complete inspection error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal menyelesaikan inspeksi',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const handleSaveChecklistResponse = async (responseData) => {
    try {
      const response = await axios.post(`/api/inspections/${inspectionId}/checklist-responses`, responseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update checklist responses state
      setChecklistResponses(prev => [...prev, response.data]);
      
      toast({
        title: 'Checklist Tersimpan',
        description: 'Respons checklist berhasil disimpan',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      return response.data;
    } catch (error) {
      console.error('Save checklist response error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal menyimpan respons checklist',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      throw error;
    }
  };

  const handleUploadPhoto = async (photoData) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoData.photo);
      formData.append('caption', photoData.caption || '');
      formData.append('floor_info', photoData.floor_info || '');
      formData.append('latitude', photoData.latitude || '');
      formData.append('longitude', photoData.longitude || '');

      const response = await axios.post(`/api/inspections/${inspectionId}/photos`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      
      // Update photos state
      setPhotos(prev => [...prev, response.data]);
      
      toast({
        title: 'Foto Diunggah',
        description: 'Foto berhasil diunggah',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      return response.data;
    } catch (error) {
      console.error('Upload photo error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal mengunggah foto',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      throw error;
    }
  };

  const statusColors = {
    scheduled: 'yellow',
    in_progress: 'orange',
    completed: 'green',
    cancelled: 'red'
  };

  if (loading) {
    return (
      <Box p={6}>
        <Skeleton height="40px" width="300px" mb={6} />
        <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="100px" borderRadius="md" />
          ))}
        </Grid>
        <Card>
          <CardBody>
            <Skeleton height="30px" width="200px" mb={4} />
            <VStack spacing={3}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="40px" width="100%" />
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  if (!inspection) {
    return (
      <Box p={6}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Inspeksi Tidak Ditemukan
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Data inspeksi yang Anda cari tidak dapat ditemukan.
          </AlertDescription>
        </Alert>
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
                Detail Inspeksi
              </Heading>
              <Badge colorScheme={statusColors[inspection.status] || 'gray'}>
                {inspection.status.replace(/_/g, ' ')}
              </Badge>
            </HStack>
            <Text fontSize="md" color="gray.600" mt={2}>
              ID: {inspection.id} | Proyek: {inspection.project?.name}
            </Text>
          </Box>

          {/* Stats Cards */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6} mb={8}>
            <Card>
              <CardBody>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.500">Tanggal Jadwal</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.500">
                    {inspection.scheduled_date 
                      ? new Date(inspection.scheduled_date).toLocaleDateString('id-ID') 
                      : '-'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.500">Inspektor</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    {inspection.inspector?.name || '-'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.500">Drafter</Text>
                  <Text fontSize="lg" fontWeight="bold" color="orange.500">
                    {inspection.drafter?.name || '-'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.500">Total Checklist</Text>
                  <Text fontSize="lg" fontWeight="bold" color="purple.500">
                    {checklistResponses.length}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          <Divider />

          {/* Action Buttons */}
          <HStack spacing={4} mb={6}>
            {inspection.status === 'scheduled' && (
              <Button 
                colorScheme="green" 
                onClick={handleStartInspection}
                size="lg"
              >
                Mulai Inspeksi
              </Button>
            )}
            
            {inspection.status === 'in_progress' && (
              <Button 
                colorScheme="blue" 
                onClick={handleCompleteInspection}
                size="lg"
              >
                Selesaikan Inspeksi
              </Button>
            )}
            
            <Button 
              colorScheme="gray" 
              onClick={() => router.push(`/dashboard/projects/${projectId}/inspections`)}
              size="lg"
            >
              Kembali ke Daftar
            </Button>
          </HStack>

          <Divider />

          {/* Tabs */}
          <Tabs variant="soft-rounded" colorScheme="blue" onChange={(index) => setActiveTab(index)}>
            <TabList>
              <Tab>Checklist Items</Tab>
              <Tab>Responses ({checklistResponses.length})</Tab>
              <Tab>Photo Documentation ({photos.length})</Tab>
              <Tab>Summary</Tab>
            </TabList>
            
            <TabPanels>
              {/* Tab 1: Checklist Items */}
              <TabPanel>
                <Box>
                  <Heading size="md" mb={4} color="gray.700">
                    Item Checklist
                  </Heading>
                  
                  {checklistItems.length > 0 ? (
                    <VStack spacing={6} align="stretch">
                      {checklistItems.map((item) => (
                        <DynamicChecklistForm
                          key={item.id}
                          checklistItem={item}
                          onSave={handleSaveChecklistResponse}
                          defaultSampleNumber={`ITEM-${item.code}-${Date.now()}`}
                        />
                      ))}
                    </VStack>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <Box flex="1">
                        <AlertTitle>Tidak ada item checklist!</AlertTitle>
                        <AlertDescription>
                          Tidak ditemukan item checklist untuk kategori ini.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </Box>
              </TabPanel>
              
              {/* Tab 2: Responses */}
              <TabPanel>
                <Box>
                  <Heading size="md" mb={4} color="gray.700">
                    Respons Checklist ({checklistResponses.length})
                  </Heading>
                  
                  {checklistResponses.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {checklistResponses.map((response) => (
                        <Card key={response.id}>
                          <CardBody>
                            <VStack spacing={3} align="stretch">
                              <HStack justify="space-between">
                                <Text fontWeight="bold" color="blue.600">
                                  {response.checklist_item?.code}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  Sample: {response.sample_number || '-'}
                                </Text>
                              </HStack>
                              
                              <Text fontSize="md" fontWeight="semibold">
                                {response.checklist_item?.description}
                              </Text>
                              
                              {/* Display response data */}
                              {response.response_data && (
                                <Box bg="gray.50" p={3} borderRadius="md">
                                  <VStack spacing={2} align="stretch">
                                    {Object.entries(response.response_data).map(([key, value]) => (
                                      <Text key={key} fontSize="sm">
                                        <strong>{key.replace(/_/g, ' ')}:</strong>{' '}
                                        {Array.isArray(value) ? value.join(', ') : value}
                                      </Text>
                                    ))}
                                  </VStack>
                                </Box>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : (
                    <Alert status="warning">
                      <AlertIcon />
                      <Box flex="1">
                        <AlertTitle>Belum ada respons!</AlertTitle>
                        <AlertDescription>
                          Anda belum menyimpan respons untuk item checklist apa pun.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </Box>
              </TabPanel>
              
              {/* Tab 3: Photo Documentation */}
              <TabPanel>
                <Box>
                  <Heading size="md" mb={4} color="gray.700">
                    Dokumentasi Foto ({photos.length})
                  </Heading>
                  
                  <PhotoUpload 
                    onUpload={handleUploadPhoto}
                    inspectionId={inspectionId}
                  />
                  
                  <Divider my={6} />
                  
                  <PhotoGallery 
                    photos={photos}
                    onDelete={(photoId) => {
                      setPhotos(prev => prev.filter(p => p.id !== photoId));
                    }}
                  />
                </Box>
              </TabPanel>
              
              {/* Tab 4: Summary */}
              <TabPanel>
                <Box>
                  <Heading size="md" mb={4} color="gray.700">
                    Ringkasan Inspeksi
                  </Heading>
                  
                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text fontSize="sm" color="gray.500">Tanggal Inspeksi</Text>
                          <Text fontSize="lg" fontWeight="bold">
                            {inspection.scheduled_date 
                              ? new Date(inspection.scheduled_date).toLocaleDateString('id-ID') 
                              : '-'}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color="gray.500">Status</Text>
                          <Badge colorScheme={statusColors[inspection.status] || 'gray'}>
                            {inspection.status.replace(/_/g, ' ')}
                          </Badge>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color="gray.500">Inspektor</Text>
                          <Text fontSize="lg" fontWeight="bold">
                            {inspection.inspector?.name || '-'}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {inspection.inspector?.email || '-'}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color="gray.500">Drafter</Text>
                          <Text fontSize="lg" fontWeight="bold">
                            {inspection.drafter?.name || '-'}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {inspection.drafter?.email || '-'}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color="gray.500">Catatan</Text>
                          <Text fontSize="md">
                            {inspection.notes || '-'}
                          </Text>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </motion.div>
  );
};

export default InspectionDetail;
