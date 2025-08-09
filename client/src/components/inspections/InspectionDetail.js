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
// Hapus import axios
// import axios from 'axios';
import { useRouter } from 'next/router';
import DynamicChecklistForm from './DynamicChecklistForm';
import PhotoUpload from './PhotoUpload';
import PhotoGallery from './PhotoGallery';

// Mock data untuk pengujian frontend
const mockUser = {
  id: 1,
  name: 'Inspector Mock User',
  email: 'inspector@mock.com',
  role: 'inspector'
};

const mockInspection = (id) => ({
  id: id,
  project: { id: 1, name: `Project Mock ${id}` },
  inspector: { id: 1, name: 'Inspector Mock', email: 'inspector@mock.com' },
  drafter: { id: 2, name: 'Drafter Mock', email: 'drafter@mock.com' },
  scheduled_date: '2023-07-15T10:00:00Z',
  status: 'scheduled', // Bisa 'scheduled', 'in_progress', 'completed'
  notes: 'Catatan inspeksi mock untuk pengujian.',
  category: 'tata_bangunan'
});

const mockChecklistItems = [
  {
    id: 1,
    code: 'TB-001',
    description: 'Periksa struktur pondasi bangunan',
    category: 'tata_bangunan',
    column_config: [
      {
        name: 'kondisi',
        label: 'Kondisi',
        type: 'radio',
        options: ['Baik', 'Cukup', 'Kurang'],
        required: true
      }
    ]
  },
  {
    id: 2,
    code: 'TB-002',
    description: 'Verifikasi kesesuaian tata ruang',
    category: 'tata_bangunan',
    column_config: [
      {
        name: 'kesesuaian',
        label: 'Kesesuaian',
        type: 'radio_with_text',
        options: ['Sesuai', 'Tidak Sesuai'],
        text_label: 'Keterangan Ketidaksesuaian',
        required: true
      }
    ]
  },
  {
    id: 3,
    code: 'TB-003',
    description: 'Periksa instalasi listrik',
    category: 'tata_bangunan',
    column_config: [
      {
        name: 'tegangan',
        label: 'Tegangan (Volt)',
        type: 'input_number',
        unit: 'V',
        required: true
      },
      {
        name: 'catatan',
        label: 'Catatan Teknis',
        type: 'textarea',
        required: false
      }
    ]
  }
];

const mockPhotos = [
  {
    id: 1,
    url: '/mock-images/mock-photo-1.jpg',
    caption: 'Foto mock 1 untuk dokumentasi',
    floor_info: 'Lantai 1',
    latitude: '-6.2088',
    longitude: '106.8456',
    uploaded_at: '2023-07-15T10:30:00Z'
  },
  {
    id: 2,
    url: '/mock-images/mock-photo-2.jpg',
    caption: 'Foto mock 2 untuk dokumentasi',
    floor_info: 'Lantai 2',
    latitude: '-6.2089',
    longitude: '106.8457',
    uploaded_at: '2023-07-15T11:00:00Z'
  }
];

const InspectionDetail = ({ inspectionId, projectId }) => {
  const [user, setUser] = useState(mockUser); // Gunakan mock user langsung
  const [inspection, setInspection] = useState(null);
  const [checklistItems, setChecklistItems] = useState(mockChecklistItems); // Gunakan mock items langsung
  const [checklistResponses, setChecklistResponses] = useState([]); // Mulai dengan array kosong
  const [photos, setPhotos] = useState(mockPhotos); // Gunakan mock photos langsung
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
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

  // Modifikasi useEffect untuk fetchInspectionData agar menggunakan mock data
  useEffect(() => {
    // Simulasi loading data
    const fetchInspectionData = async () => {
      if (!inspectionId) return;
      
      try {
        setLoading(true);
        
        // Simulasi delay API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Gunakan mock data
        setInspection(mockInspection(inspectionId));
        // checklistItems sudah diset dari state awal
        // photos sudah diset dari state awal
        // checklistResponses dimulai kosong
        
      } catch (err) {
        console.error('Error fetching inspection data (Mock):', err);
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

    fetchInspectionData();
  }, [inspectionId, toast]);

  // Modifikasi handler untuk menggunakan logika mock
  const handleStartInspection = async () => {
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update status inspection mock
      setInspection(prev => ({
        ...prev,
        status: 'in_progress'
      }));
      
      toast({
        title: 'Inspeksi Dimulai',
        description: 'Inspeksi telah dimulai (Mock)',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Start inspection error (Mock):', error);
      toast({
        title: 'Error',
        description: 'Gagal memulai inspeksi (Mock)',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const handleCompleteInspection = async () => {
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update status inspection mock
      setInspection(prev => ({
        ...prev,
        status: 'completed'
      }));
      
      toast({
        title: 'Inspeksi Selesai',
        description: 'Inspeksi telah diselesaikan (Mock)',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Complete inspection error (Mock):', error);
      toast({
        title: 'Error',
        description: 'Gagal menyelesaikan inspeksi (Mock)',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const handleSaveChecklistResponse = async (responseData) => {
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Buat objek response mock
      const mockResponse = {
        id: Date.now(), // ID mock sederhana
        inspection_id: inspectionId,
        checklist_item_id: responseData.checklist_item_id,
        sample_number: responseData.sample_number,
        response_data: responseData.responses,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        checklist_item: mockChecklistItems.find(item => item.id === responseData.checklist_item_id)
      };
      
      // Update checklist responses state
      setChecklistResponses(prev => [...prev, mockResponse]);
      
      toast({
        title: 'Checklist Tersimpan',
        description: 'Respons checklist berhasil disimpan (Mock)',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      return mockResponse;
    } catch (error) {
      console.error('Save checklist response error (Mock):', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan respons checklist (Mock)',
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
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Buat objek photo mock
      const mockPhoto = {
        id: Date.now() + Math.floor(Math.random() * 1000), // ID mock sederhana
        url: URL.createObjectURL(photoData.photo), // Buat URL untuk file yang diunggah
        caption: photoData.caption || 'Foto baru (Mock)',
        floor_info: photoData.floor_info || 'Lantai tidak diketahui',
        latitude: photoData.latitude || '',
        longitude: photoData.longitude || '',
        uploaded_at: new Date().toISOString()
      };
      
      // Update photos state
      setPhotos(prev => [...prev, mockPhoto]);
      
      toast({
        title: 'Foto Diunggah',
        description: 'Foto berhasil diunggah (Mock)',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      return mockPhoto;
    } catch (error) {
      console.error('Upload photo error (Mock):', error);
      toast({
        title: 'Error',
        description: 'Gagal mengunggah foto (Mock)',
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
            Data inspeksi yang Anda cari tidak dapat ditemukan. (Mock)
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
                Detail Inspeksi (Mock Mode)
              </Heading>
              <Badge colorScheme={statusColors[inspection.status] || 'gray'}>
                {inspection.status.replace(/_/g, ' ')} (Mock)
              </Badge>
            </HStack>
            <Text fontSize="md" color="gray.600" mt={2}>
              ID: {inspection.id} | Proyek: {inspection.project?.name} (Mock)
            </Text>
          </Box>

          {/* Stats Cards */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6} mb={8}>
            <Card>
              <CardBody>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.500">Tanggal Jadwal (Mock)</Text>
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
                  <Text fontSize="sm" color="gray.500">Inspektor (Mock)</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    {inspection.inspector?.name || '-'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.500">Drafter (Mock)</Text>
                  <Text fontSize="lg" fontWeight="bold" color="orange.500">
                    {inspection.drafter?.name || '-'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.500">Total Checklist (Mock)</Text>
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
                Mulai Inspeksi (Mock)
              </Button>
            )}
            
            {inspection.status === 'in_progress' && (
              <Button 
                colorScheme="blue" 
                onClick={handleCompleteInspection}
                size="lg"
              >
                Selesaikan Inspeksi (Mock)
              </Button>
            )}
            
            <Button 
              colorScheme="gray" 
              onClick={() => router.push(`/dashboard/projects/${projectId}/inspections`)}
              size="lg"
            >
              Kembali ke Daftar (Mock)
            </Button>
          </HStack>

          <Divider />

          {/* Tabs */}
          <Tabs variant="soft-rounded" colorScheme="blue" onChange={(index) => setActiveTab(index)}>
            <TabList>
              <Tab>Checklist Items (Mock)</Tab>
              <Tab>Responses ({checklistResponses.length}) (Mock)</Tab>
              <Tab>Photo Documentation ({photos.length}) (Mock)</Tab>
              <Tab>Summary (Mock)</Tab>
            </TabList>
            
            <TabPanels>
              {/* Tab 1: Checklist Items */}
              <TabPanel>
                <Box>
                  <Heading size="md" mb={4} color="gray.700">
                    Item Checklist (Mock)
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
                        <AlertTitle>Tidak ada item checklist! (Mock)</AlertTitle>
                        <AlertDescription>
                          Tidak ditemukan item checklist untuk kategori ini. (Mock)
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
                    Respons Checklist ({checklistResponses.length}) (Mock)
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
                        <AlertTitle>Belum ada respons! (Mock)</AlertTitle>
                        <AlertDescription>
                          Anda belum menyimpan respons untuk item checklist apa pun. (Mock)
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
                    Dokumentasi Foto ({photos.length}) (Mock)
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
                    Ringkasan Inspeksi (Mock)
                  </Heading>
                  
                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text fontSize="sm" color="gray.500">Tanggal Inspeksi (Mock)</Text>
                          <Text fontSize="lg" fontWeight="bold">
                            {inspection.scheduled_date 
                              ? new Date(inspection.scheduled_date).toLocaleDateString('id-ID') 
                              : '-'}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color="gray.500">Status (Mock)</Text>
                          <Badge colorScheme={statusColors[inspection.status] || 'gray'}>
                            {inspection.status.replace(/_/g, ' ')}
                          </Badge>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color="gray.500">Inspektor (Mock)</Text>
                          <Text fontSize="lg" fontWeight="bold">
                            {inspection.inspector?.name || '-'}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {inspection.inspector?.email || '-'}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color="gray.500">Drafter (Mock)</Text>
                          <Text fontSize="lg" fontWeight="bold">
                            {inspection.drafter?.name || '-'}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {inspection.drafter?.email || '-'}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color="gray.500">Catatan (Mock)</Text>
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