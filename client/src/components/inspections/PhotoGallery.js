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
  useDisclosure
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ViewIcon, DownloadIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';

const PhotoGallery = ({ inspectionId, onPhotoDelete }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchPhotos = async () => {
    if (!inspectionId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`/api/inspections/${inspectionId}/photos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPhotos(response.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: 'Gagal memuat foto',
        description: error.response?.data?.error || 'Terjadi kesalahan saat memuat foto.',
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

  const handleDownloadPhoto = (photo) => {
    const link = document.createElement('a');
    link.href = `/uploads/${photo.file_path}`;
    link.download = photo.file_path.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/inspections/photos/${photoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: 'Foto dihapus',
        description: 'Foto berhasil dihapus dari galeri.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      // Refresh gallery
      fetchPhotos();
      
      // Callback to parent
      if (onPhotoDelete) {
        onPhotoDelete(photoId);
      }
    } catch (error) {
      console.error('Delete photo error:', error);
      toast({
        title: 'Gagal menghapus foto',
        description: error.response?.data?.error || 'Terjadi kesalahan saat menghapus foto.',
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
        <Text color="gray.500">Belum ada foto yang diunggah</Text>
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
                  <Image
                    src={`/uploads/${photo.file_path}`}
                    alt={photo.caption || 'Foto dokumentasi'}
                    maxH="200px"
                    objectFit="cover"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.200"
                    cursor="pointer"
                    onClick={() => handleViewPhoto(photo)}
                  />
                  <HStack 
                    position="absolute" 
                    bottom={2} 
                    right={2}
                    spacing={2}
                  >
                    <IconButton
                      icon={<ViewIcon />}
                      aria-label="View photo"
                      size="sm"
                      colorScheme="blackAlpha"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPhoto(photo);
                      }}
                    />
                    <IconButton
                      icon={<DownloadIcon />}
                      aria-label="Download photo"
                      size="sm"
                      colorScheme="blackAlpha"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPhoto(photo);
                      }}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete photo"
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
                <Image
                  src={`/uploads/${selectedPhoto.file_path}`}
                  alt={selectedPhoto.caption || 'Foto dokumentasi'}
                  maxH="70vh"
                  objectFit="contain"
                  w="100%"
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
                    
                    <HStack justifyContent="flex-end" pt={2}>
                      <Button
                        leftIcon={<DownloadIcon />}
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleDownloadPhoto(selectedPhoto)}
                      >
                        Unduh Foto
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
