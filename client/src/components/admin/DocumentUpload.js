// client/src/components/admin/DocumentUpload.js
import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  HStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Image,
  IconButton,
  Badge,
  Divider,
  Skeleton
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AttachmentIcon, CloseIcon, DownloadIcon, ViewIcon } from '@chakra-ui/icons';
import axios from 'axios';

const DocumentUpload = ({ projectId, onUploadSuccess, defaultDocumentType = '' }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [documentType, setDocumentType] = useState(defaultDocumentType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const toast = useToast();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Document type options based on regulations
  const documentTypes = [
    { value: 'SURAT_PERMOHONAN', label: 'Surat Permohonan SLF' },
    { value: 'AS_BUILT_DRAWINGS', label: 'As-built Drawings' },
    { value: 'KRK', label: 'Keterangan Rencana Kota (KRK)' },
    { value: 'IMB_LAMA', label: 'IMB Lama' },
    { value: 'SLF_LAMA', label: 'SLF Lama' },
    { value: 'STATUS_TANAH', label: 'Status Tanah' },
    { value: 'FOTO_LOKASI', label: 'Foto Lokasi' },
    { value: 'QUOTATION', label: 'Quotation' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'SPK', label: 'Surat Perintah Kerja (SPK)' },
    { value: 'REPORT', label: 'Laporan SLF' },
    { value: 'TEKNIS_STRUKTUR', label: 'Dokumen Teknis Struktur' },
    { value: 'TEKNIS_ARSITEKTUR', label: 'Dokumen Teknis Arsitektur' },
    { value: 'TEKNIS_UTILITAS', label: 'Dokumen Teknis Utilitas' },
    { value: 'TEKNIS_SANITASI', label: 'Dokumen Teknis Sanitasi' },
    { value: 'BUKTI_TRANSFER', label: 'Bukti Transfer Pembayaran' },
    { value: 'INVOICE', label: 'Invoice' },
    { value: 'PAYMENT_RECEIPT', label: 'Payment Receipt' },
    { value: 'GOVERNMENT_APPROVAL', label: 'Government Approval' },
    { value: 'SLF_FINAL', label: 'SLF Final' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/') && 
          !file.type.startsWith('application/pdf') && 
          !file.type.startsWith('application/msword') && 
          !file.type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        setError('File harus berupa gambar (JPEG, PNG), PDF, atau dokumen Word');
        toast({
          title: 'File tidak valid',
          description: 'File harus berupa gambar (JPEG, PNG), PDF, atau dokumen Word',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        return;
      }
      
      if (file.size > 20 * 1024 * 1024) { // 20MB
        setError('Ukuran file terlalu besar (maksimal 20MB)');
        toast({
          title: 'File terlalu besar',
          description: 'Ukuran file maksimal 20MB',
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
      
      // Auto-generate title from filename
      if (!title) {
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setTitle(fileNameWithoutExt);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Tidak ada file',
        description: 'Silakan pilih dokumen terlebih dahulu',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (!documentType) {
      toast({
        title: 'Jenis dokumen wajib dipilih',
        description: 'Silakan pilih jenis dokumen yang akan diunggah',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Judul dokumen wajib diisi',
        description: 'Silakan masukkan judul dokumen',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (!projectId) {
      toast({
        title: 'ID Proyek tidak ditemukan',
        description: 'Tidak dapat mengunggah dokumen tanpa ID proyek',
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
      // Create FormData
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('type', documentType);
      formData.append('title', title);
      formData.append('description', description || '');
      formData.append('project_id', projectId);

      // Upload with progress tracking
      const response = await axios.post(
        `/api/admin/projects/${projectId}/documents`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percentage = Math.round((loaded / total) * 100);
            setProgress(percentage);
          }
        }
      );

      toast({
        title: 'Dokumen berhasil diunggah',
        description: response.data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setDocumentType(defaultDocumentType);
      setTitle('');
      setDescription('');
      setProgress(0);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Callback for success
      if (onUploadSuccess) {
        onUploadSuccess(response.data.document);
      }

    } catch (error) {
      console.error('Upload document error:', error);
      setError(error.response?.data?.error || 'Gagal mengunggah dokumen');
      toast({
        title: 'Gagal mengunggah dokumen',
        description: error.response?.data?.error || 'Terjadi kesalahan saat mengunggah dokumen',
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewFile = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const handleDownloadFile = () => {
    if (selectedFile) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = selectedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" color="blue.600">
                Upload Dokumen
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Unggah dokumen terkait proyek sesuai dengan regulasi
              </Text>
            </Box>

            <Divider />

            <VStack spacing={4} align="stretch">
              {/* Document Type Selection */}
              <FormControl isRequired>
                <FormLabel>Jenis Dokumen</FormLabel>
                <Select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  placeholder="Pilih jenis dokumen"
                  isDisabled={uploading}
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Document Title */}
              <FormControl isRequired>
                <FormLabel>Judul Dokumen</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul dokumen"
                  isDisabled={uploading}
                />
              </FormControl>

              {/* Document Description */}
              <FormControl>
                <FormLabel>Deskripsi (Opsional)</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Masukkan deskripsi dokumen"
                  isDisabled={uploading}
                />
              </FormControl>

              {/* File Upload */}
              <FormControl>
                <FormLabel>Dokumen</FormLabel>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  display="none"
                  isDisabled={uploading}
                />
                
                <HStack spacing={4}>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<AttachmentIcon />}
                    colorScheme="blue"
                    variant="outline"
                    isDisabled={uploading}
                  >
                    Pilih Dokumen
                  </Button>
                  
                  {selectedFile && (
                    <Badge colorScheme="green">
                      {selectedFile.name}
                    </Badge>
                  )}
                </HStack>
              </FormControl>

              {/* File Preview */}
              {previewUrl && (
                <Box position="relative">
                  <Image
                    src={previewUrl}
                    alt="Preview dokumen"
                    maxH="300px"
                    objectFit="cover"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.200"
                  />
                  <HStack 
                    position="absolute" 
                    top={2} 
                    right={2}
                    spacing={2}
                  >
                    <IconButton
                      icon={<ViewIcon />}
                      aria-label="View document"
                      size="sm"
                      colorScheme="blackAlpha"
                      onClick={handleViewFile}
                    />
                    <IconButton
                      icon={<DownloadIcon />}
                      aria-label="Download document"
                      size="sm"
                      colorScheme="blackAlpha"
                      onClick={handleDownloadFile}
                    />
                    <IconButton
                      icon={<CloseIcon />}
                      aria-label="Remove document"
                      size="sm"
                      colorScheme="red"
                      onClick={handleRemoveFile}
                      isDisabled={uploading}
                    />
                  </HStack>
                </Box>
              )}

              {/* Error Message */}
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertTitle mr={2}>Error!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Upload Progress */}
              {uploading && (
                <VStack spacing={3} w="100%">
                  <Text fontSize="sm" color="blue.600">
                    Mengunggah dokumen... {progress}%
                  </Text>
                  <Progress 
                    value={progress} 
                    size="sm" 
                    colorScheme="blue" 
                    w="100%" 
                    hasStripe 
                    isAnimated 
                  />
                </VStack>
              )}

              {/* Upload Button */}
              <HStack justifyContent="flex-end">
                <Button
                  colorScheme="green"
                  onClick={handleUpload}
                  isLoading={uploading}
                  loadingText="Mengunggah..."
                  isDisabled={!selectedFile || !documentType || !title.trim() || uploading}
                  size="lg"
                >
                  Upload Dokumen
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default DocumentUpload;
