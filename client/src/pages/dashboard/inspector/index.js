// src/pages/dashboard/inspector/index.js
import React, { useState, useEffect } from 'react';
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Skeleton,
  Progress,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  FormHelperText,
  FormControl,
  FormErrorMessage,
  useDisclosure,
  Radio, 
  RadioGroup,
  Image,
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiFolder, FiUsers, FiFileText, FiCheckCircle, FiUser, FiFile, FiBarChart2, FiDollarSign, FiCamera, FiUpload, FiList, FiPlus, FiEye, FiEdit, FiTrash2, FiDownload, FiMapPin, FiCalendar, FiClock, FiCheckSquare, FiX, FiMenu, FiChevronDown } from 'react-icons/fi';

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

// Mock data untuk checklist items
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
  }
];

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
    longitude: 106.8457,
    created_at: '2023-07-15T11:00:00Z',
    uploader: { name: 'Inspector A' }
  }
];

const InspectorDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  const [stats, setStats] = useState(mockStats);
  const [pendingInspections, setPendingInspections] = useState(mockPendingInspections);
  const [checklistItems, setChecklistItems] = useState(mockChecklistItems);
  const [photos, setPhotos] = useState(mockPhotos);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [floorInfo, setFloorInfo] = useState('');
  const [caption, setCaption] = useState('');
  const [includeLocation, setIncludeLocation] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationLoading, setLocationLoading] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);
  const fileInputRef = React.useRef(null);
  const cameraInputRef = React.useRef(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const statusColors = {
    scheduled: 'blue',
    in_progress: 'orange',
    completed: 'green',
    cancelled: 'red'
  };

  // Handle view inspection
  const handleViewInspection = (inspectionId) => {
    router.push(`/dashboard/inspector/inspections/${inspectionId}`);
  };

  // Handle view all inspections
  const handleViewAllInspections = () => {
    router.push('/dashboard/inspector/inspections');
  };

  // Handle view checklists
  const handleViewChecklists = () => {
    router.push('/dashboard/inspector/checklists');
  };

  // Handle view reports
  const handleViewReports = () => {
    router.push('/dashboard/inspector/reports');
  };

  // Handle view documents
  const handleViewDocuments = () => {
    router.push('/dashboard/inspector/documents');
  };

  // Handle file select for photo upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar (JPEG, PNG, GIF, dll)');
        toast({
          title: 'File tidak valid',
          description: 'File harus berupa gambar.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('Ukuran file terlalu besar (maksimal 10MB)');
        toast({
          title: 'File terlalu besar',
          description: 'Ukuran file maksimal 10MB.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  // Handle take photo (mock)
  const handleTakePhoto = async () => {
    if (!cameraSupported) {
      toast({
        title: 'Kamera tidak didukung',
        description: 'Perangkat Anda tidak mendukung akses kamera.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    try {
      // Simulate camera access
      toast({
        title: 'Akses Kamera (Mock)',
        description: 'Mengakses kamera untuk mengambil foto...',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      // Simulate photo taken
      setTimeout(() => {
        const mockPhoto = new File([], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(mockPhoto);
        setPreviewUrl('/mock-images/photo-preview.jpg');
        toast({
          title: 'Foto Diambil (Mock)',
          description: 'Foto berhasil diambil dari kamera.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      }, 1500);
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: 'Error',
        description: 'Gagal mengakses kamera.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  // Handle upload photo (mock)
  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      toast({
        title: 'Tidak ada file',
        description: 'Silakan pilih foto terlebih dahulu.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update photos state
        const newPhoto = {
          id: photos.length + 1,
          url: previewUrl,
          caption: caption || 'Foto baru',
          floor_info: floorInfo || 'Lantai tidak diketahui',
          latitude: location.latitude || null,
          longitude: location.longitude || null,
          created_at: new Date().toISOString(),
          uploader: { name: user.name }
        };
        
        setPhotos(prev => [...prev, newPhoto]);
        
        clearInterval(interval);
        setProgress(100);
        
        toast({
          title: 'Foto berhasil diunggah',
          description: 'Foto telah berhasil diunggah (Mock Mode).',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
        
        // Reset form
        setTimeout(() => {
          setSelectedFile(null);
          setPreviewUrl('');
          setFloorInfo('');
          setCaption('');
          setProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 500);
      } catch (uploadError) {
        clearInterval(interval);
        throw uploadError;
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Gagal mengunggah foto.');
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal mengunggah foto.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle remove file
  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setFloorInfo('');
    setCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle save checklist response (mock)
  const handleSaveChecklistResponse = (responseData) => {
    console.log('Mock saving checklist response:', responseData);
    toast({
      title: 'Checklist Tersimpan',
      description: 'Respons checklist berhasil disimpan (Mock Mode).',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
  };

  // Format bytes helper
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Stat card component
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

  return (
    <DashboardLayout user={user}>
      <Box p={6}>
        <VStack spacing={6} align="stretch">
          <Heading mb={6} color="blue.600">Inspector Dashboard</Heading>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            <StatCard label="Total Inspections" value={stats.totalInspections} />
            <StatCard label="Pending Inspections" value={stats.pendingInspections} />
            <StatCard label="Completed Inspections" value={stats.completedInspections} />
            <StatCard label="Upcoming Inspections" value={stats.upcomingInspections} />
          </SimpleGrid>

          <Tabs variant="enclosed-colored" colorScheme="blue">
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Checklists</Tab>
              <Tab>Photo Upload</Tab>
              <Tab>Photo Gallery</Tab>
              <Tab>Reports</Tab>
              <Tab>Documents</Tab>
            </TabList>
            
            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card>
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="md" color="blue.600">Pending Inspections</Heading>
                        <Button 
                          colorScheme="blue" 
                          size="sm"
                          onClick={handleViewAllInspections}
                        >
                          View All
                        </Button>
                      </HStack>
                      
                      {pendingInspections.length > 0 ? (
                        <TableContainer>
                          <Table variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Project</Th>
                                <Th>Client</Th>
                                <Th>Scheduled Date</Th>
                                <Th>Location</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {pendingInspections.map(inspection => (
                                <Tr key={inspection.id}>
                                  <Td>
                                    <Text fontWeight="bold">{inspection.projectName}</Text>
                                  </Td>
                                  <Td>{inspection.client}</Td>
                                  <Td>{new Date(inspection.scheduledDate).toLocaleString('id-ID')}</Td>
                                  <Td>{inspection.location}</Td>
                                  <Td>
                                    <Badge colorScheme={statusColors[inspection.status] || 'gray'}>
                                      {inspection.status.replace(/_/g, ' ')}
                                    </Badge>
                                  </Td>
                                  <Td>
                                    <HStack spacing={2}>
                                      <Button
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={() => handleViewInspection(inspection.id)}
                                        leftIcon={<FiEye />}
                                      >
                                        View
                                      </Button>
                                    </HStack>
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
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Card>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <Heading size="md" color="blue.600">Quick Actions</Heading>
                          <HStack spacing={4} wrap="wrap">
                            <Button 
                              colorScheme="green" 
                              onClick={handleViewChecklists}
                              leftIcon={<FiList />}
                            >
                              View Checklists
                            </Button>
                            <Button 
                              colorScheme="orange" 
                              onClick={handleViewReports}
                              leftIcon={<FiFileText />}
                            >
                              View Reports
                            </Button>
                            <Button 
                              colorScheme="purple" 
                              onClick={handleViewDocuments}
                              leftIcon={<FiFile />}
                            >
                              View Documents
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                    
                    <Card>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <Heading size="md" color="blue.600">Recent Activity</Heading>
                          <VStack spacing={3} align="stretch">
                            <Text fontSize="sm">• Inspection #123 completed for Project Alpha</Text>
                            <Text fontSize="sm">• Checklist TB-001 submitted for Project Beta</Text>
                            <Text fontSize="sm">• 5 photos uploaded for Project Gamma</Text>
                            <Text fontSize="sm">• Report #456 generated for Project Delta</Text>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Checklists Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card>
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="md" color="blue.600">Dynamic Checklist Forms</Heading>
                        <Button 
                          colorScheme="blue" 
                          size="sm"
                          onClick={handleViewChecklists}
                          leftIcon={<FiPlus />}
                        >
                          Create New
                        </Button>
                      </HStack>
                      
                      {checklistItems.length > 0 ? (
                        <VStack spacing={6} align="stretch">
                          {checklistItems.map(item => (
                            <Card key={item.id} variant="outline">
                              <CardBody>
                                <VStack spacing={4} align="stretch">
                                  <HStack justify="space-between">
                                    <VStack align="stretch" spacing={1}>
                                      <Text fontWeight="bold" color="blue.600">{item.code}</Text>
                                      <Text fontSize="md">{item.description}</Text>
                                      <Text fontSize="sm" color="gray.500">Category: {item.category}</Text>
                                    </VStack>
                                    <HStack spacing={2}>
                                      <Button
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={() => router.push(`/dashboard/inspector/checklists/${item.id}`)}
                                        leftIcon={<FiEdit />}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        colorScheme="green"
                                        onClick={() => router.push(`/dashboard/inspector/checklists/${item.id}/view`)}
                                        leftIcon={<FiEye />}
                                      >
                                        View
                                      </Button>
                                    </HStack>
                                  </HStack>
                                  
                                  <Divider />
                                  
                                  {/* Mock checklist form */}
                                  <VStack spacing={3} align="stretch">
                                    {item.column_config.map((column, index) => {
                                      const { name, type, options = [], label, text_label, unit = '' } = column;
                                      const value = ''; // Mock value
                                      
                                      switch (type) {
                                        case 'radio':
                                          return (
                                            <FormControl key={index} isRequired={column.required}>
                                              <FormLabel fontSize="sm" fontWeight="medium">{label || name}</FormLabel>
                                              <HStack spacing={4}>
                                                {options.map((option) => (
                                                  <Radio key={option} value={option} size="sm">
                                                    {option}
                                                  </Radio>
                                                ))}
                                              </HStack>
                                            </FormControl>
                                          );
                                          
                                        case 'radio_with_text':
                                          return (
                                            <FormControl key={index} isRequired={column.required}>
                                              <FormLabel fontSize="sm" fontWeight="medium">{label || name}</FormLabel>
                                              <HStack spacing={4}>
                                                {options.map((option) => (
                                                  <Radio key={option} value={option} size="sm">
                                                    {option}
                                                  </Radio>
                                                ))}
                                              </HStack>
                                              <FormLabel fontSize="sm" mt={2}>{text_label || 'Keterangan'}</FormLabel>
                                              <Textarea
                                                size="sm"
                                                placeholder={text_label || 'Masukkan keterangan...'}
                                                minHeight="100px"
                                              />
                                            </FormControl>
                                          );
                                          
                                        case 'input_number':
                                          return (
                                            <FormControl key={index} isRequired={column.required}>
                                              <FormLabel fontSize="sm" fontWeight="medium">
                                                {label || name} {unit ? `(${unit})` : ''}
                                              </FormLabel>
                                              <Input
                                                size="sm"
                                                type="number"
                                                placeholder={`Masukkan nilai ${unit ? `(${unit})` : ''}`}
                                              />
                                            </FormControl>
                                          );
                                          
                                        case 'textarea':
                                          return (
                                            <FormControl key={index} isRequired={column.required}>
                                              <FormLabel fontSize="sm" fontWeight="medium">{label || name}</FormLabel>
                                              <Textarea
                                                size="sm"
                                                placeholder={label || `Masukkan ${name}...`}
                                                minHeight="100px"
                                              />
                                            </FormControl>
                                          );
                                          
                                        default:
                                          return (
                                            <FormControl key={index} isRequired={column.required}>
                                              <FormLabel fontSize="sm" fontWeight="medium">
                                                {label || name} (Tipe: {type})
                                              </FormLabel>
                                              <Input
                                                size="sm"
                                                placeholder={`Input untuk ${type}...`}
                                              />
                                            </FormControl>
                                          );
                                      }
                                    })}
                                    
                                    <HStack justify="flex-end" spacing={3}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => router.push(`/dashboard/inspector/checklists/${item.id}/view`)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={() => handleSaveChecklistResponse({ checklist_item_id: item.id })}
                                      >
                                        Save Response
                                      </Button>
                                    </HStack>
                                  </VStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      ) : (
                        <Alert status="info">
                          <AlertIcon />
                          <Box flex="1">
                            <AlertTitle>No Checklist Items!</AlertTitle>
                            <AlertDescription>
                              There are no checklist items configured for this category.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Photo Upload Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card>
                    <CardBody>
                      <Heading size="md" mb={4} color="blue.600">Photo Upload</Heading>
                      
                      <Alert status="info" mb={4}>
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Mock Mode!</AlertTitle>
                          <AlertDescription>
                            This is a simulation. In a real application, you would upload actual photos.
                          </AlertDescription>
                        </Box>
                      </Alert>
                      
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Floor Info</FormLabel>
                          <Select 
                            value={floorInfo} 
                            onChange={(e) => setFloorInfo(e.target.value)}
                            placeholder="Select floor"
                          >
                            <option value="Lantai 1">Lantai 1</option>
                            <option value="Lantai 2">Lantai 2</option>
                            <option value="Lantai 3">Lantai 3</option>
                            <option value="Lantai 4">Lantai 4</option>
                            <option value="Lantai 5">Lantai 5</option>
                            <option value="Atap">Atap</option>
                            <option value="Basement">Basement</option>
                            <option value="Luar Bangunan">Luar Bangunan</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Caption</FormLabel>
                          <Input
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Enter photo caption..."
                          />
                        </FormControl>

                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          display="none"
                        />
                        
                        <Input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileSelect}
                          display="none"
                        />

                        <HStack spacing={4}>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            leftIcon={<FiUpload />}
                            colorScheme="blue"
                            variant="outline"
                            isDisabled={uploading}
                          >
                            Choose Photo
                          </Button>
                          
                          {cameraSupported && (
                            <Button
                              onClick={handleTakePhoto}
                              leftIcon={<FiCamera />}
                              colorScheme="green"
                              variant="outline"
                              isDisabled={uploading}
                            >
                              Take Photo
                            </Button>
                          )}
                        </HStack>
                        
                        {error && (
                          <Alert status="error">
                            <AlertIcon />
                            <AlertTitle mr={2}>Error!</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        
                        {previewUrl && (
                          <Box position="relative">
                            <Image
                              src={previewUrl}
                              alt="Preview"
                              maxH="300px"
                              objectFit="cover"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="gray.200"
                            />
                            <IconButton
                              icon={<FiX />}
                              aria-label="Remove photo"
                              size="sm"
                              colorScheme="red"
                              position="absolute"
                              top={2}
                              right={2}
                              onClick={handleRemoveFile}
                              isDisabled={uploading}
                            />
                          </Box>
                        )}
                        
                        {uploading && (
                          <VStack spacing={3} w="100%">
                            <Text fontSize="sm" color="blue.600">Uploading...</Text>
                            <Progress value={progress} size="sm" colorScheme="blue" w="100%" hasStripe isAnimated />
                            <Text fontSize="xs" color="gray.500">
                              {progress}% complete
                            </Text>
                          </VStack>
                        )}
                        
                        <HStack justifyContent="flex-end">
                          <Button
                            onClick={handleUploadPhoto}
                            colorScheme="green"
                            isLoading={uploading}
                            loadingText="Uploading..."
                            isDisabled={!selectedFile || uploading}
                            leftIcon={<FiUpload />}
                          >
                            Upload Photo
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Photo Gallery Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card>
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="md" color="blue.600">Photo Gallery</Heading>
                        <Button 
                          colorScheme="blue" 
                          size="sm"
                          onClick={() => router.push('/dashboard/inspector/photos')}
                          leftIcon={<FiPlus />}
                        >
                          Upload New
                        </Button>
                      </HStack>
                      
                      {photos.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                          {photos.map(photo => (
                            <Card key={photo.id} variant="outline">
                              <CardBody p={0}>
                                <Box position="relative">
                                  <Image
                                    src={photo.url}
                                    alt={photo.caption || 'Photo'}
                                    maxH="200px"
                                    objectFit="cover"
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor="gray.200"
                                  />
                                  <HStack 
                                    position="absolute" 
                                    bottom={2} 
                                    right={2}
                                    spacing={2}
                                  >
                                    <IconButton
                                      icon={<FiEye />}
                                      aria-label="View photo"
                                      size="sm"
                                      colorScheme="blackAlpha"
                                      onClick={() => router.push(`/dashboard/inspector/photos/${photo.id}`)}
                                    />
                                    <IconButton
                                      icon={<FiDownload />}
                                      aria-label="Download photo"
                                      size="sm"
                                      colorScheme="blackAlpha"
                                      onClick={() => {
                                        toast({
                                          title: 'Download Photo (Mock)',
                                          description: 'Photo download initiated.',
                                          status: 'info',
                                          duration: 3000,
                                          isClosable: true,
                                          position: 'top-right'
                                        });
                                      }}
                                    />
                                    <IconButton
                                      icon={<FiTrash2 />}
                                      aria-label="Delete photo"
                                      size="sm"
                                      colorScheme="red"
                                      onClick={() => {
                                        setPhotos(prev => prev.filter(p => p.id !== photo.id));
                                        toast({
                                          title: 'Photo Deleted (Mock)',
                                          description: 'Photo has been deleted.',
                                          status: 'success',
                                          duration: 3000,
                                          isClosable: true,
                                          position: 'top-right'
                                        });
                                      }}
                                    />
                                  </HStack>
                                </Box>
                                
                                <VStack align="stretch" p={3} spacing={1}>
                                  {photo.caption && (
                                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                      {photo.caption}
                                    </Text>
                                  )}
                                  
                                  {photo.floor_info && (
                                    <Text fontSize="xs" color="gray.500">
                                      Floor: {photo.floor_info}
                                    </Text>
                                  )}
                                  
                                  {photo.latitude && photo.longitude && (
                                    <Text fontSize="xs" color="gray.500">
                                      GPS: {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                                    </Text>
                                  )}
                                  
                                  <Text fontSize="xs" color="gray.500">
                                    Uploaded: {new Date(photo.created_at).toLocaleDateString('id-ID')}
                                  </Text>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <Alert status="info">
                          <AlertIcon />
                          <Box flex="1">
                            <AlertTitle>No Photos!</AlertTitle>
                            <AlertDescription>
                              There are no photos uploaded yet.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Reports Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card>
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="md" color="blue.600">Inspection Reports</Heading>
                        <Button 
                          colorScheme="blue" 
                          size="sm"
                          onClick={() => router.push('/dashboard/inspector/reports')}
                          leftIcon={<FiPlus />}
                        >
                          Create New Report
                        </Button>
                      </HStack>
                      
                      <Alert status="info" mb={4}>
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Mock Mode!</AlertTitle>
                          <AlertDescription>
                            This section displays mock inspection reports. In a real application, 
                            reports would be generated from inspection data.
                          </AlertDescription>
                        </Box>
                      </Alert>
                      
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Report ID</Th>
                              <Th>Project</Th>
                              <Th>Inspection Date</Th>
                              <Th>Status</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td>
                                <Text fontWeight="bold">#REP-001</Text>
                              </Td>
                              <Td>Project Alpha</Td>
                              <Td>2023-06-15</Td>
                              <Td>
                                <Badge colorScheme="green">Completed</Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => router.push('/dashboard/inspector/reports/1')}
                                    leftIcon={<FiEye />}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="green"
                                    onClick={() => {
                                      toast({
                                        title: 'Download Report (Mock)',
                                        description: 'Report download initiated.',
                                        status: 'info',
                                        duration: 3000,
                                        isClosable: true,
                                        position: 'top-right'
                                      });
                                    }}
                                    leftIcon={<FiDownload />}
                                  >
                                    Download
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                            <Tr>
                              <Td>
                                <Text fontWeight="bold">#REP-002</Text>
                              </Td>
                              <Td>Project Beta</Td>
                              <Td>2023-06-20</Td>
                              <Td>
                                <Badge colorScheme="yellow">In Progress</Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => router.push('/dashboard/inspector/reports/2')}
                                    leftIcon={<FiEye />}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="green"
                                    onClick={() => {
                                      toast({
                                        title: 'Download Report (Mock)',
                                        description: 'Report download initiated.',
                                        status: 'info',
                                        duration: 3000,
                                        isClosable: true,
                                        position: 'top-right'
                                      });
                                    }}
                                    leftIcon={<FiDownload />}
                                  >
                                    Download
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Documents Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card>
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="md" color="blue.600">Document Management</Heading>
                        <Button 
                          colorScheme="blue" 
                          size="sm"
                          onClick={() => router.push('/dashboard/inspector/documents')}
                          leftIcon={<FiPlus />}
                        >
                          Upload New Document
                        </Button>
                      </HStack>
                      
                      <Alert status="info" mb={4}>
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Mock Mode!</AlertTitle>
                          <AlertDescription>
                            This section manages mock documents related to inspections. 
                            In a real application, documents would be stored and retrieved from a server.
                          </AlertDescription>
                        </Box>
                      </Alert>
                      
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Document Name</Th>
                              <Th>Project</Th>
                              <Th>Type</Th>
                              <Th>Size</Th>
                              <Th>Uploaded At</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td>
                                <Text fontWeight="bold">Inspection_Report_Alpha.pdf</Text>
                              </Td>
                              <Td>Project Alpha</Td>
                              <Td>PDF</Td>
                              <Td>{formatBytes(2457600)}</Td>
                              <Td>2023-06-15</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => router.push('/dashboard/inspector/documents/1')}
                                    leftIcon={<FiEye />}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="green"
                                    onClick={() => {
                                      toast({
                                        title: 'Download Document (Mock)',
                                        description: 'Document download initiated.',
                                        status: 'info',
                                        duration: 3000,
                                        isClosable: true,
                                        position: 'top-right'
                                      });
                                    }}
                                    leftIcon={<FiDownload />}
                                  >
                                    Download
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                            <Tr>
                              <Td>
                                <Text fontWeight="bold">Checklist_Beta.docx</Text>
                              </Td>
                              <Td>Project Beta</Td>
                              <Td>DOCX</Td>
                              <Td>{formatBytes(1835008)}</Td>
                              <Td>2023-06-20</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => router.push('/dashboard/inspector/documents/2')}
                                    leftIcon={<FiEye />}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="green"
                                    onClick={() => {
                                      toast({
                                        title: 'Download Document (Mock)',
                                        description: 'Document download initiated.',
                                        status: 'info',
                                        duration: 3000,
                                        isClosable: true,
                                        position: 'top-right'
                                      });
                                    }}
                                    leftIcon={<FiDownload />}
                                  >
                                    Download
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </CardBody>
                  </Card>
                </VStack>
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