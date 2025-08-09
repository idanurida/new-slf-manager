// client/src/components/inspections/PhotoGallery.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  Card,
  CardBody,
  useToast,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  IconButton,
  VStack,
  HStack,
  Badge,
  Divider,
  Button,
  useDisclosure,
  Alert, // Tambahkan Alert
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link as ChakraLink // Tambahkan Link
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ViewIcon, DownloadIcon, DeleteIcon } from '@chakra-ui/icons';
// Hapus import axios
// import axios from 'axios';
import NextLink from 'next/link'; // Tambahkan NextLink

// Mock data untuk foto
const mockPhotos = [
  {
    id: 1,
    file_path: 'photo1.jpg',
    caption: 'Foto dokumentasi struktur pondasi',
    floor_info: 'Lantai 1',
    latitude: -6.2088,
    longitude: 106.8456,
    created_at: '2023-07-15T10:30:00Z',
    uploader: { id: 1, name: 'Inspector A' }
  },
  {
    id: 2,
    file_path: 'photo2.jpg',
    caption: 'Pemeriksaan instalasi listrik',
    floor_info: 'Lantai 2',
    latitude: -6.2089,
    longitude: 106.8457,
    created_at: '2023-07-15T11:00:00Z',
    uploader: { id: 1, name: 'Inspector A' }
  },
  {
    id: 3,
    file_path: 'photo3.jpg',
    caption: 'Detail sudut bangunan',
    floor_info: 'Lantai 3',
    latitude: -6.2090,
    longitude: 106.8458,
    created_at: '2023-07-15T11:30:00Z',
    uploader: { id: 2, name: 'Inspector B' }
  }
];

const PhotoGallery = ({ inspectionId, onPhotoDelete }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Modifikasi fetchPhotos untuk menggunakan mock data
  const fetchPhotos = async () => {
    if (!inspectionId) return;
    
    try {
      setLoading(true);
      
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Gunakan mock data
      setPhotos(mockPhotos);
      
    } catch (error) {
      console.error('Error fetching photos (Mock):', error);
      toast({
        title: 'Gagal memuat foto',
        description: 'Terjadi kesalahan saat memuat foto. (Mock)',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [inspectionId]);

  const handleViewPhoto = (photo) => {
    setSelectedPhoto(photo);
    onOpen();
  };

  // Modifikasi handleDownloadPhoto untuk menggunakan cara yang lebih aman
  const handleDownloadPhoto = (photo) => {
    // Dalam mode mock/testing, kita bisa menampilkan alert atau link
    // Karena ini mock, kita tidak benar-benar mengunduh file
    toast({
      title: 'Simulasi Unduh',
      description: `Akan mengunduh foto: ${photo.file_path} (Mock)`,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
    
    // Alternatif: Buka foto di tab baru (hanya jika di browser)
    if (typeof window !== 'undefined') {
      // window.open(`/uploads/${photo.file_path}`, '_blank');
      // Atau, karena ini mock, kita bisa menunjukkan path file:
      console.log(`[Mock Download] File path: /uploads/${photo.file_path}`);
    }
  };

  // Modifikasi handleDeletePhoto untuk menggunakan logika mock
  const handleDeletePhoto = async (photoId) => {
    // Dalam mode mock, kita tidak benar-benar menghapus
    // Tapi kita bisa menampilkan konfirmasi dan simulasi
    
    // Simulasi konfirmasi (kita bisa menggunakan Chakra UI Alert Dialog untuk ini dalam produksi)
    // Untuk kesederhanaan, kita langsung proses
    
    setDeleting(true);
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update state photos untuk menghapus foto
      setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoId));
      
      toast({
        title: 'Foto dihapus',
        description: 'Foto berhasil dihapus dari galeri. (Mock)',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      // Callback to parent
      if (onPhotoDelete) {
        onPhotoDelete(photoId);
      }
      
      // Jika foto yang sedang dilihat dihapus, tutup modal
      if (selectedPhoto && selectedPhoto.id === photoId) {
        onClose();
        setSelectedPhoto(null);
      }
      
    } catch (error) {
      console.error('Delete photo error (Mock):', error);
      toast({
        title: 'Gagal menghapus foto',
        description: 'Terjadi kesalahan saat menghapus foto. (Mock)',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} height="200px" borderRadius="md" />
        ))}
      </SimpleGrid>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Belum ada foto yang diunggah (Mock)
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Foto yang diunggah selama inspeksi akan muncul di sini.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardBody p={0}>
                <Box position="relative">
                  {/* Gunakan path absolut untuk mock image atau placeholder */}
                  <Image
                    src={`/mock-images/${photo.file_path}` || '/placeholder-image.jpg'}
                    alt={photo.caption || 'Foto dokumentasi (Mock)'}
                    maxH="200px"
                    objectFit="cover"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.200"
                    cursor="pointer"
                    onClick={() => handleViewPhoto(photo)}
                    fallbackSrc="/placeholder-image.jpg" // Tambahkan fallback
                  />
                  <HStack 
                    position="absolute" 
                    bottom={2} 
                    right={2}
                    spacing={2}
                  >
                    <IconButton
                      icon={<ViewIcon />}
                      aria-label="View photo (Mock)"
                      size="sm"
                      colorScheme="blackAlpha"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPhoto(photo);
                      }}
                    />
                    <IconButton
                      icon={<DownloadIcon />}
                      aria-label="Download photo (Mock)"
                      size="sm"
                      colorScheme="blackAlpha"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPhoto(photo);
                      }}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete photo (Mock)"
                      size="sm"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      isLoading={deleting}
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
                      Lantai: {photo.floor_info}
                    </Text>
                  )}
                  
                  {photo.latitude && photo.longitude && (
                    <Text fontSize="xs" color="gray.500">
                      GPS: {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                    </Text>
                  )}
                  
                  <Text fontSize="xs" color="gray.500">
                    Diunggah: {new Date(photo.created_at).toLocaleDateString('id-ID')}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </SimpleGrid>

      {/* Modal for photo preview */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={0}>
            {selectedPhoto && (
              <VStack spacing={0} align="stretch">
                {/* Gunakan path absolut untuk mock image atau placeholder */}
                <Image
                  src={`/mock-images/${selectedPhoto.file_path}` || '/placeholder-image.jpg'}
                  alt={selectedPhoto.caption || 'Foto dokumentasi (Mock)'}
                  maxH="70vh"
                  objectFit="contain"
                  w="100%"
                  fallbackSrc="/placeholder-image.jpg" // Tambahkan fallback
                />
                
                <Box p={4}>
                  <VStack align="stretch" spacing={3}>
                    {selectedPhoto.caption && (
                      <Text fontSize="lg" fontWeight="bold">
                        {selectedPhoto.caption}
                      </Text>
                    )}
                    
                    <Divider />
                    
                    <HStack wrap="wrap" spacing={4}>
                      <Text fontSize="sm">
                        <strong>Lantai:</strong> {selectedPhoto.floor_info || '-'}
                      </Text>
                      
                      {selectedPhoto.latitude && selectedPhoto.longitude && (
                        <Text fontSize="sm">
                          <strong>Koordinat:</strong> {selectedPhoto.latitude.toFixed(6)}, {selectedPhoto.longitude.toFixed(6)}
                        </Text>
                      )}
                      
                      <Text fontSize="sm">
                        <strong>Diunggah oleh:</strong> {selectedPhoto.uploader?.name || 'Unknown'}
                      </Text>
                      
                      <Text fontSize="sm">
                        <strong>Tanggal:</strong> {new Date(selectedPhoto.created_at).toLocaleString('id-ID')}
                      </Text>
                    </HStack>
                    
                    <Alert status="info" size="sm">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Mode Mock!</AlertTitle>
                        <AlertDescription>
                          Ini adalah simulasi. Dalam aplikasi nyata, Anda bisa mengunduh foto ini.
                        </AlertDescription>
                      </Box>
                    </Alert>
                    
                    <HStack justifyContent="flex-end" pt={2}>
                      <Button
                        leftIcon={<DownloadIcon />}
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleDownloadPhoto(selectedPhoto)}
                      >
                        Simulasi Unduh Foto (Mock)
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PhotoGallery;