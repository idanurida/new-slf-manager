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
  Select,
  Switch,
  FormHelperText
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AttachmentIcon, CloseIcon, SmallAddIcon } from '@chakra-ui/icons'; // Ganti icon

const PhotoUpload = ({ onUpload, inspectionId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [floorInfo, setFloorInfo] = useState('');
  const [caption, setCaption] = useState('');
  const [includeLocation, setIncludeLocation] = useState(false); // State untuk toggle geotagging
  const [location, setLocation] = useState({ latitude: null, longitude: null }); // State untuk koordinat
  const [locationLoading, setLocationLoading] = useState(false); // State untuk loading lokasi
  const [cameraSupported, setCameraSupported] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const toast = useToast();

  // Periksa dukungan kamera
  useEffect(() => {
    // Cek dukungan kamera saat komponen mount (hanya di browser)
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // Jika berhasil, hentikan stream dan set dukungan kamera
          stream.getTracks().forEach(track => track.stop());
          setCameraSupported(true);
        })
        .catch(err => {
          // Jika gagal, kamera tidak didukung atau ditolak
          console.warn('Kamera tidak didukung atau akses ditolak:', err);
          setCameraSupported(false);
        });
    } else {
      setCameraSupported(false);
    }
  }, []); // Hanya dijalankan sekali saat komponen mount

  // Fungsi untuk mendapatkan lokasi (geotagging)
  const getLocation = () => {
    // Periksa dukungan geolocation
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation tidak didukung',
        description: 'Perangkat Anda tidak mendukung geolocation.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      // Kembalikan promise yang resolve dengan lokasi null
      return Promise.resolve({ latitude: null, longitude: null });
    }

    // Kembalikan promise untuk mendapatkan lokasi
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Jika berhasil mendapatkan posisi
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          resolve({ latitude, longitude });
        },
        (error) => {
          // Jika gagal mendapatkan posisi
          console.error('Error getting location:', error);
          toast({
            title: 'Gagal mendapatkan lokasi',
            description: `Error: ${error.message}. Geotagging akan dilewati.`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'top-right'
          });
          // Resolve dengan null jika gagal
          resolve({ latitude: null, longitude: null });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 detik timeout
          maximumAge: 300000 // Gunakan cache maksimal 5 menit
        }
      );
    });
  };

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
    // Periksa dukungan kamera sebelum mencoba mengakses
    if (!cameraSupported) {
      toast({
        title: 'Kamera tidak didukung',
        description: 'Perangkat Anda tidak mendukung akses kamera atau izin ditolak.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    try {
      // Akses kamera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Tunggu beberapa detik untuk kamera siap
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            // Buat file dari blob
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
        
        // Hentikan stream kamera
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
      let locationData = { latitude: null, longitude: null };
      
      // Jika toggle geotagging diaktifkan, dapatkan lokasi
      if (includeLocation) {
        setLocationLoading(true);
        try {
          locationData = await getLocation();
        } finally {
          setLocationLoading(false);
        }
      }

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

      try {
        // Panggil fungsi upload dari parent component dengan data lengkap
        await onUpload({
          photo: selectedFile,
          floor_info: floorInfo,
          caption: caption,
          latitude: locationData.latitude,   // Sertakan latitude
          longitude: locationData.longitude  // Sertakan longitude
        });

        // Hentikan interval dan set progress ke 100
        clearInterval(interval);
        setProgress(100);
        
        toast({
          title: 'Foto berhasil diunggah',
          description: includeLocation && locationData.latitude && locationData.longitude 
            ? `Foto dengan lokasi (${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}) berhasil diunggah (Mock).`
            : 'Foto telah berhasil diunggah (Mock).',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
        
        // Reset form setelah delay kecil untuk menunjukkan progress 100%
        setTimeout(() => {
          setSelectedFile(null);
          setPreviewUrl('');
          setFloorInfo('');
          setCaption('');
          setIncludeLocation(false);
          setLocation({ latitude: null, longitude: null });
          setProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 500);
      } catch (uploadError) {
        clearInterval(interval);
        throw uploadError; // Lempar ulang error untuk ditangkap oleh blok catch luar
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
    // Cabut URL object untuk mencegah kebocoran memori
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setFloorInfo('');
    setCaption('');
    setIncludeLocation(false);
    setLocation({ latitude: null, longitude: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Bersihkan URL object ketika komponen unmount atau previewUrl berubah
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

            {/* Toggle untuk Geotagging */}
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="geotag-switch" mb="0">
                Sertakan Lokasi (Geotagging)
              </FormLabel>
              <Switch
                id="geotag-switch"
                isChecked={includeLocation}
                onChange={(e) => setIncludeLocation(e.target.checked)}
                isDisabled={locationLoading || uploading}
              />
              <FormHelperText ml={2}>(Opsional)</FormHelperText>
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
                  leftIcon={<SmallAddIcon />} 
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
                <Text fontSize="sm" color="blue.600">
                  {locationLoading ? "Mendapatkan lokasi..." : "Mengunggah..."}
                </Text>
                <Progress 
                  value={locationLoading ? undefined : progress} 
                  size="sm" 
                  colorScheme="blue" 
                  w="100%" 
                  hasStripe 
                  isAnimated 
                  isIndeterminate={locationLoading} // Tampilkan indikator loading tak tentu saat mendapat lokasi
                />
                {!locationLoading && (
                  <Text fontSize="xs" color="gray.500">
                    {progress}% complete
                  </Text>
                )}
              </VStack>
            )}
            
            <HStack justifyContent="flex-end">
              <Button
                onClick={handleUpload}
                colorScheme="green"
                isLoading={uploading || locationLoading}
                loadingText={locationLoading ? "Mendapatkan lokasi..." : "Mengunggah"}
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