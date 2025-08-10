// src/pages/dashboard/inspector/index.js
import React, { useState } from 'react'; // Tambahkan useState
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  VStack,
  HStack,
  Divider,
  Alert, // Tambahkan Alert
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast // Tambahkan useToast
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion'; // Tambahkan framer-motion jika digunakan di komponen

// Import komponen dari folder components/inspections/
import DynamicChecklistForm from '../../../components/inspections/DynamicChecklistForm';
import InspectionDetail from '../../../components/inspections/InspectionDetail';
import InspectionList from '../../../components/inspections/InspectionList';
import PhotoGallery from '../../../components/inspections/PhotoGallery';
import PhotoUpload from '../../../components/inspections/PhotoUpload';

// Mock data statis untuk testing frontend
const mockUser = {
  id: 1,
  name: 'Inspector Mock User',
  role: 'inspector',
  email: 'inspector@mock.com'
};

const mockStats = {
  totalInspections: 12,
  pendingInspections: 5,
  completedInspections: 7,
  upcomingInspections: 3
};

// Mock data untuk komponen-komponen inspeksi
const mockPendingInspections = [
  {
    id: 1,
    projectName: 'Project Alpha',
    client: 'PT. Bangun Jaya',
    scheduledDate: '2023-06-20T10:00:00Z',
    location: 'Jakarta',
    status: 'scheduled'
  },
  {
    id: 2,
    projectName: 'Project Beta',
    client: 'CV. Maju Terus',
    scheduledDate: '2023-06-25T14:00:00Z',
    location: 'Bandung',
    status: 'scheduled'
  }
];

// Mock data untuk checklist item
const mockChecklistItem = {
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
};

// Mock data untuk foto
const mockPhotos = [
  {
    id: 1,
    url: '/mock-images/photo1.jpg',
    caption: 'Foto dokumentasi struktur pondasi',
    floor_info: 'Lantai 1',
    latitude: -6.2088,
    longitude: 106.8456,
    created_at: '2023-07-15T10:30:00Z',
    uploader: { name: 'Inspector A' }
  },
  {
    id: 2,
    url: '/mock-images/photo2.jpg',
    caption: 'Pemeriksaan instalasi listrik',
    floor_info: 'Lantai 2',
    latitude: -6.2089,
    longitude: 106.8456,
    created_at: '2023-07-15T11:00:00Z',
    uploader: { name: 'Inspector A' }
  }
];

const InspectorDashboard = () => {
  const router = useRouter();
  const toast = useToast(); // Untuk menampilkan notifikasi

  const handleViewInspection = (inspectionId) => {
    router.push(`/dashboard/inspector/inspections/${inspectionId}`);
  };

  // Handler mock untuk komponen-komponen inspeksi
  const handleSaveChecklistResponse = (responseData) => {
    console.log('Mock saving checklist response:', responseData);
    toast({
      title: 'Checklist Tersimpan',
      description: 'Respons checklist berhasil disimpan (Mock).',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
    // Dalam aplikasi nyata, ini akan menyimpan data ke server
  };

  const handleUploadPhoto = (photoData) => {
    console.log('Mock uploading photo:', photoData);
    toast({
      title: 'Foto Diunggah',
      description: 'Foto berhasil diunggah (Mock).',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
    // Dalam aplikasi nyata, ini akan mengunggah file ke server
  };

  const statusColors = {
    scheduled: 'blue',
    in_progress: 'orange',
    completed: 'green',
    cancelled: 'red'
  };

  const StatCard = ({ label, value }) => (
    <Card as={motion.div} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
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
        <VStack spacing={6} align="stretch">
          <Heading mb={6} color="blue.600">Inspector Dashboard - Kekayaan Fungsionalitas</Heading>

          {/* Statistik */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <StatCard label="Total Inspections" value={mockStats.totalInspections} />
            <StatCard label="Pending Inspections" value={mockStats.pendingInspections} />
            <StatCard label="Completed Inspections" value={mockStats.completedInspections} />
            <StatCard label="Upcoming Inspections" value={mockStats.upcomingInspections} />
          </SimpleGrid>

          {/* Tabs untuk berbagai fungsionalitas */}
          <Tabs variant="enclosed-colored" colorScheme="blue">
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Checklist</Tab>
              <Tab>Photo Upload</Tab>
              <Tab>Photo Gallery</Tab>
            </TabList>

            <TabPanels>
              {/* Tab Overview */}
              <TabPanel>
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Pending Inspections</Heading>
                    {mockPendingInspections.length > 0 ? (
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Project</Th>
                              <Th>Client</Th>
                              <Th>Scheduled Date</Th>
                              <Th>Location</Th>
                              <Th>Status</Th>
                              <Th>Action</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {mockPendingInspections.map(inspection => (
                              <Tr key={inspection.id}>
                                <Td>
                                  <Text fontWeight="bold">{inspection.projectName}</Text>
                                </Td>
                                <Td>{inspection.client}</Td>
                                <Td>{new Date(inspection.scheduledDate).toLocaleString('id-ID')}</Td>
                                <Td>{inspection.location}</Td>
                                <Td>
                                  <Badge colorScheme={statusColors[inspection.status]}>
                                    {inspection.status.replace(/_/g, ' ')}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => handleViewInspection(inspection.id)}
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
                      <Text>No pending inspections</Text>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Tab Checklist */}
              <TabPanel>
                <Box>
                  <Heading size="md" mb={4}>Dynamic Checklist Form</Heading>
                  <Alert status="info" mb={4}>
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>Mode Mock!</AlertTitle>
                      <AlertDescription>
                        Form checklist di bawah ini menggunakan data mock. Dalam aplikasi nyata, 
                        data akan diambil dari API berdasarkan kategori inspeksi.
                      </AlertDescription>
                    </Box>
                  </Alert>
                  <Card>
                    <CardBody>
                      <DynamicChecklistForm
                        checklistItem={mockChecklistItem}
                        onSave={handleSaveChecklistResponse}
                        defaultSampleNumber="ITEM-TB-001-MOCK"
                      />
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>

              {/* Tab Photo Upload */}
              <TabPanel>
                <Box>
                  <Heading size="md" mb={4}>Photo Upload</Heading>
                  <Alert status="info" mb={4}>
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>Mode Mock!</AlertTitle>
                      <AlertDescription>
                        Fitur upload foto di bawah ini menggunakan simulasi. Dalam aplikasi nyata, 
                        file akan diunggah ke server.
                      </AlertDescription>
                    </Box>
                  </Alert>
                  <PhotoUpload
                    onUpload={handleUploadPhoto}
                    inspectionId="mock-inspection-id"
                  />
                </Box>
              </TabPanel>

              {/* Tab Photo Gallery */}
              <TabPanel>
                <Box>
                  <Heading size="md" mb={4}>Photo Gallery</Heading>
                  <Alert status="info" mb={4}>
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>Mode Mock!</AlertTitle>
                      <AlertDescription>
                        Galeri foto di bawah ini menggunakan data mock. Dalam aplikasi nyata, 
                        foto akan diambil dari server berdasarkan ID inspeksi.
                      </AlertDescription>
                    </Box>
                  </Alert>
                  <PhotoGallery
                    photos={mockPhotos}
                    onPhotoDelete={(photoId) => {
                      console.log('Mock deleting photo ID:', photoId);
                      toast({
                        title: 'Foto Dihapus',
                        description: 'Foto berhasil dihapus (Mock).',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right'
                      });
                    }}
                  />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default InspectorDashboard;

export async function getStaticProps() {
  return {
    props: {} // Kosongkan karena semua data di-mock di komponen
  };
}