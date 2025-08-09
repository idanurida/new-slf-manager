// client/src/components/inspections/PhotoUpload.js
import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Image,
  VStack,
  Text,
  useToast,
  Card,
  CardBody,
  HStack,
  IconButton,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  Select
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AttachmentIcon, CloseIcon, CameraIcon } from '@chakra-ui/icons'; // Perbaiki import

// Ganti CameraIcon dengan icon yang tersedia, misalnya menggunakan AttachmentIcon dua kali
// atau import icon lain yang sesuai dari @chakra-ui/icons

const PhotoUpload = ({ onUpload, inspectionId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [floorInfo, setFloorInfo] = useState('');
  const [caption, setCaption] = useState('');
  const [cameraSupported, setCameraSupported] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const toast = useToast();

  // Periksa dukungan kamera
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          setCameraSupported(true);
        })
        .catch(err => {
          console.warn('Kamera tidak didukung:', err);
          setCameraSupported(false);
        });
    } else {
      setCameraSupported(false);
    }
  }, []);

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
          } else {
            toast({
              title: 'Error',
              description: 'Gagal membuat foto dari kamera.',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right'
            });
          }
        }, 'image/jpeg', 0.95);
        
        stream.getTracks().forEach(track => track.stop());
      }, 1000);
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

  const handleUpload = async () => {
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

    if (!inspectionId) {
      toast({
        title: 'ID Inspeksi tidak ditemukan',
        description: 'Tidak dapat mengunggah foto tanpa ID inspeksi.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
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
        await onUpload({
          photo: selectedFile,
          floor_info: floorInfo,
          caption: caption
        });

        clearInterval(interval);
        setProgress(100);
        
        toast({
          title: 'Foto berhasil diunggah',
          description: 'Foto telah berhasil diunggah (Mock).',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
        
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
        title: 'Upload gagal',
        description: error.message || 'Terjadi kesalahan saat mengunggah foto.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setUploading(false);
    }
  };

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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Lantai</FormLabel>
              <Select 
                value={floorInfo} 
                onChange={(e) => setFloorInfo(e.target.value)}
                placeholder="Pilih lantai"
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
                placeholder="Masukkan caption foto..."
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
                leftIcon={<AttachmentIcon />}
                colorScheme="blue"
                variant="outline"
                isDisabled={uploading}
              >
                Pilih Foto
              </Button>
              
              {cameraSupported && (
                <Button
                  onClick={handleTakePhoto}
                  leftIcon={<AttachmentIcon />} // Gunakan icon yang sama atau sesuaikan
                  colorScheme="green"
                  variant="outline"
                  isDisabled={uploading}
                >
                  Ambil Foto
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
                  icon={<CloseIcon />}
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
                <Text fontSize="sm" color="blue.600">Mengunggah...</Text>
                <Progress value={progress} size="sm" colorScheme="blue" w="100%" hasStripe isAnimated />
                <Text fontSize="xs" color="gray.500">
                  {progress}% complete
                </Text>
              </VStack>
            )}
            
            <HStack justifyContent="flex-end">
              <Button
                onClick={handleUpload}
                colorScheme="green"
                isLoading={uploading}
                loadingText="Mengunggah"
                isDisabled={!selectedFile || uploading}
                size="sm"
              >
                Unggah Foto
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default PhotoUpload;