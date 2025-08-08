// client/src/components/inspections/PhotoUpload.js
import React, { useRef, useState } from 'react';
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
import { AttachmentIcon, CloseIcon, CameraIcon } from '@chakra-ui/icons';

const PhotoUpload = ({ onUpload, inspectionId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [floorInfo, setFloorInfo] = useState('');
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const toast = useToast();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi file
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
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Tunggu beberapa detik untuk kamera siap
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        }, 'image/jpeg', 0.95);
        
        stream.getTracks().forEach(track => track.stop());
      }, 1000);
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: 'Error',
        description: 'Gagal mengakses kamera. Silakan pilih file dari galeri.',
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
      // Simulasi progress upload
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Panggil fungsi upload dari parent component
      await onUpload({
        file: selectedFile,
        floor_info: floorInfo,
        caption: caption
      }, () => {
        // Callback untuk update progress jika diperlukan
        clearInterval(interval);
        setProgress(100);
      });

      clearInterval(interval);
      
      toast({
        title: 'Foto berhasil diunggah',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setFloorInfo('');
      setCaption('');
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setFloorInfo('');
    setCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
              
              <Button
                onClick={() => cameraInputRef.current?.click()}
                leftIcon={<CameraIcon />}
                colorScheme="green"
                variant="outline"
                isDisabled={uploading}
              >
                Ambil Foto
              </Button>
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
