// client/src/components/reports/ReportGenerator.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Divider,
  Badge,
  Tooltip,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { DownloadIcon, InfoIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useRouter } from 'next/router';

const ReportGenerator = ({ project, inspection, user, onReportGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportStatus, setReportStatus] = useState('idle');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [error, setError] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Reset state when project or inspection changes
  useEffect(() => {
    setReportStatus('idle');
    setGeneratedReport(null);
    setProgress(0);
    setError('');
  }, [project?.id, inspection?.id]);

  const handleGenerateReport = async (format = 'pdf') => {
    if (!project || !inspection) {
      toast({
        title: 'Error',
        description: 'Proyek atau inspeksi tidak ditemukan',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setLoading(true);
    setProgress(0);
    setReportStatus('generating');
    setError('');

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Generate report
      const endpoint = `/api/reports/projects/${project.id}/inspections/${inspection.id}/${format}`;
      
      const response = await axios.post(endpoint, {
        title: `Laporan SLF - ${project.name} - ${new Date().toLocaleDateString('id-ID')}`,
        project_id: project.id,
        inspection_id: inspection.id,
        format: format
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      clearInterval(interval);
      setProgress(100);
      setReportStatus('generated');
      setGeneratedReport(response.data.report);

      toast({
        title: 'Berhasil',
        description: `Laporan ${format.toUpperCase()} berhasil dibuat`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      // Callback jika diperlukan
      if (onReportGenerated) {
        onReportGenerated(response.data.report);
      }

      // Auto close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Generate report error:', error);
      clearInterval(interval);
      setReportStatus('error');
      setError(error.response?.data?.error || `Gagal membuat laporan ${format.toUpperCase()}`);
      
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Gagal membuat laporan ${format.toUpperCase()}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = () => {
    if (generatedReport && generatedReport.file_path) {
      window.open(`/uploads/${generatedReport.file_path}`, '_blank');
    } else {
      toast({
        title: 'Info',
        description: 'Laporan belum tersedia untuk dilihat',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const handleDownloadReport = () => {
    if (generatedReport && generatedReport.file_path) {
      const link = document.createElement('a');
      link.href = `/uploads/${generatedReport.file_path}`;
      link.download = `Laporan_SLF_${project.name}_${generatedReport.id}.${generatedReport.file_type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: 'Error',
        description: 'File laporan tidak ditemukan',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      idle: 'gray',
      generating: 'yellow',
      generated: 'green',
      error: 'red'
    };
    return colors[status] || 'gray';
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'generating': return 'blue';
      case 'generated': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box>
              <Heading size="lg" color="blue.600" mb={2}>
                Generator Laporan SLF
              </Heading>
              <Text color="gray.600">
                Buat laporan pemeriksaan kelaikan fungsi secara otomatis
              </Text>
            </Box>

            <Divider />

            {/* Project Info */}
            <Card variant="outline">
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Heading size="md" color="gray.700">
                    Informasi Proyek
                  </Heading>
                  
                  <HStack justify="space-between" wrap="wrap">
                    <Box>
                      <Text fontWeight="semibold">{project?.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {project?.owner_name}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        Fungsi Bangunan: {project?.building_function}
                      </Text>
                    </Box>
                    
                    <Box textAlign="right">
                      <Badge colorScheme="blue" fontSize="sm">
                        {project?.request_type?.replace(/_/g, ' ') || 'baru'}
                      </Badge>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        ID Proyek: {project?.id}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Jumlah Lantai: {project?.floors}
                      </Text>
                    </Box>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Inspection Info */}
            {inspection && (
              <Card variant="outline">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Heading size="md" color="gray.700">
                      Informasi Inspeksi
                    </Heading>
                    
                    <HStack justify="space-between" wrap="wrap">
                      <Box>
                        <Text fontWeight="semibold">
                          Inspeksi #{inspection.id}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Tanggal Jadwal: {inspection.scheduled_date 
                            ? new Date(inspection.scheduled_date).toLocaleDateString('id-ID') 
                            : '-'}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          Status: {inspection.status?.replace(/_/g, ' ') || 'scheduled'}
                        </Text>
                      </Box>
                      
                      <Box textAlign="right">
                        <Badge colorScheme="green" fontSize="sm">
                          {inspection.inspector?.name || 'Belum diassign'}
                        </Badge>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Drafter: {inspection.drafter?.name || 'Belum diassign'}
                        </Text>
                      </Box>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Report Generation Options */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md" color="gray.700">
                    Pilihan Format Laporan
                  </Heading>
                  
                  <Text fontSize="sm" color="gray.600">
                    Pilih format laporan yang ingin dibuat:
                  </Text>
                  
                  <HStack spacing={4} wrap="wrap">
                    <Button
                      colorScheme="blue"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handleGenerateReport('pdf')}
                      isLoading={loading && reportStatus === 'generating'}
                      loadingText="Membuat PDF..."
                      isDisabled={!inspection || reportStatus === 'generating'}
                      size="lg"
                    >
                      Buat Laporan PDF
                    </Button>
                    
                    <Button
                      colorScheme="green"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handleGenerateReport('docx')}
                      isLoading={loading && reportStatus === 'generating'}
                      loadingText="Membuat DOCX..."
                      isDisabled={!inspection || reportStatus === 'generating'}
                      size="lg"
                    >
                      Buat Laporan DOCX
                    </Button>
                    
                    <Tooltip label="Lihat template laporan">
                      <IconButton
                        icon={<InfoIcon />}
                        colorScheme="gray"
                        variant="outline"
                        aria-label="Lihat template"
                        onClick={onOpen}
                      />
                    </Tooltip>
                  </HStack>
                  
                  {/* Progress Bar */}
                  {reportStatus === 'generating' && (
                    <Box>
                      <Progress 
                        value={progress} 
                        colorScheme={getProgressColor(reportStatus)} 
                        size="sm" 
                        hasStripe 
                        isAnimated 
                        mb={2}
                      />
                      <Text fontSize="xs" color="gray.500" textAlign="center">
                        Membuat laporan... {progress}%
                      </Text>
                    </Box>
                  )}
                  
                  {/* Generated Report Info */}
                  {generatedReport && reportStatus === 'generated' && (
                    <Alert 
                      status="success" 
                      variant="subtle"
                      borderRadius="md"
                    >
                      <AlertIcon as={CheckCircleIcon} />
                      <Box flex="1">
                        <AlertTitle>Laporan Berhasil Dibuat!</AlertTitle>
                        <AlertDescription>
                          Laporan "{generatedReport.title}" telah berhasil dibuat dan siap untuk diunduh.
                        </AlertDescription>
                      </Box>
                      <HStack spacing={2}>
                        <Button 
                          size="sm" 
                          colorScheme="blue" 
                          onClick={handleViewReport}
                        >
                          Lihat
                        </Button>
                        <Button 
                          size="sm" 
                          colorScheme="green" 
                          onClick={handleDownloadReport}
                          leftIcon={<DownloadIcon />}
                        >
                          Unduh
                        </Button>
                      </HStack>
                    </Alert>
                  )}
                  
                  {/* Error Message */}
                  {error && reportStatus === 'error' && (
                    <Alert 
                      status="error" 
                      variant="subtle"
                      borderRadius="md"
                    >
                      <AlertIcon as={WarningIcon} />
                      <Box flex="1">
                        <AlertTitle>Error!</AlertTitle>
                        <AlertDescription>
                          {error}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Report Template Preview Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  <Heading size="md" color="blue.600">
                    Template Laporan SLF
                  </Heading>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" color="gray.600">
                      Berikut adalah struktur template laporan yang akan digunakan:
                    </Text>
                    
                    <Card>
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <Heading size="sm" color="gray.700">
                            Struktur Laporan
                          </Heading>
                          
                          <VStack align="stretch" spacing={2}>
                            <Text fontWeight="semibold">1. Cover Page</Text>
                            <Text fontSize="sm" color="gray.600">
                              - Judul: Laporan Pemeriksaan Kelaikan Fungsi Bangunan Gedung
                              - Nama Proyek: {project?.name}
                              - Pemilik: {project?.owner_name}
                              - Alamat: {project?.address}
                              - Tanggal: {new Date().toLocaleDateString('id-ID')}
                            </Text>
                            
                            <Text fontWeight="semibold">2. Executive Summary</Text>
                            <Text fontSize="sm" color="gray.600">
                              - Ringkasan temuan utama
                              - Rekomendasi teknis
                              - Status kelaikan fungsi
                            </Text>
                            
                            <Text fontWeight="semibold">3. Detailed Findings</Text>
                            <Text fontSize="sm" color="gray.600">
                              - Hasil checklist pemeriksaan
                              - Foto dokumentasi
                              - Analisis teknis
                            </Text>
                            
                            <Text fontWeight="semibold">4. Recommendations</Text>
                            <Text fontSize="sm" color="gray.600">
                              - Rekomendasi perbaikan
                              - Timeline implementasi
                              - Biaya estimasi (jika ada)
                            </Text>
                            
                            <Text fontWeight="semibold">5. Appendices</Text>
                            <Text fontSize="sm" color="gray.600">
                              - Dokumen pendukung
                              - Referensi regulasi
                              - Tanda tangan tim pemeriksa
                            </Text>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                    
                    <Alert status="info" variant="subtle">
                      <AlertIcon />
                      <AlertDescription>
                        Laporan akan dibuat secara otomatis berdasarkan data inspeksi dan checklist yang telah diisi.
                      </AlertDescription>
                    </Alert>
                  </VStack>
                </ModalBody>
                
                <ModalFooter>
                  <Button colorScheme="blue" mr={3} onClick={onClose}>
                    Tutup
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ReportGenerator;
