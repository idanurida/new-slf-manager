// client/src/components/reports/ReportForm.js
import React, { useState, useEffect } from 'react';
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
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Tooltip,
  IconButton
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { InfoIcon, DownloadIcon, ViewIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useRouter } from 'next/router';

const ReportForm = ({ project, inspection, user }) => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const toast = useToast();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch existing reports for this project
  useEffect(() => {
    const fetchReports = async () => {
      if (!project?.id || !token) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/projects/${project.id}/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(response.data.reports || response.data);
      } catch (error) {
        console.error('Fetch reports error:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat data laporan',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [project?.id, token, toast]);

  const handleGenerateReport = async (format) => {
    if (!inspection) {
      toast({
        title: 'Error',
        description: 'Inspeksi belum dipilih',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    try {
      setLoading(true);
      
      const endpoint = format === 'pdf' 
        ? `/api/reports/projects/${project.id}/inspections/${inspection.id}/pdf`
        : `/api/reports/projects/${project.id}/inspections/${inspection.id}/docx`;

      const response = await axios.post(endpoint, {
        title: `Laporan SLF - ${project.name} - ${new Date().toLocaleDateString('id-ID')}`,
        format: format
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Berhasil',
        description: `Laporan ${format.toUpperCase()} berhasil dibuat`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      // Refresh reports list
      const refreshResponse = await axios.get(`/api/projects/${project.id}/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(refreshResponse.data.reports || refreshResponse.data);

    } catch (error) {
      console.error('Generate report error:', error);
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

  const handleViewReport = (report) => {
    if (report.file_path) {
      window.open(`/uploads/${report.file_path}`, '_blank');
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

  const handleDownloadReport = (report) => {
    if (report.file_path) {
      const link = document.createElement('a');
      link.href = `/uploads/${report.file_path}`;
      link.download = `Laporan_SLF_${project.name}_${report.id}.${report.file_type}`;
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
      draft: 'gray',
      generated: 'blue',
      project_lead_review: 'yellow',
      project_lead_approved: 'orange',
      head_consultant_review: 'purple',
      head_consultant_approved: 'pink',
      client_review: 'cyan',
      client_approved: 'green',
      client_rejected: 'red',
      sent_to_government: 'teal',
      slf_issued: 'green',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Skeleton height="30px" width="200px" />
              <Skeleton height="40px" width="100%" />
              <Skeleton height="200px" width="100%" />
              <Skeleton height="40px" width="150px" />
            </VStack>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

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
                Laporan SLF
              </Heading>
              <Text color="gray.600">
                Kelola laporan pemeriksaan kelaikan fungsi untuk proyek ini
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
                  
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="semibold">{project?.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {project?.owner_name}
                      </Text>
                    </Box>
                    
                    <Box textAlign="right">
                      <Badge colorScheme="blue" fontSize="sm">
                        {project?.request_type?.replace(/_/g, ' ') || 'baru'}
                      </Badge>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        ID: {project?.id}
                      </Text>
                    </Box>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Report Generation */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md" color="gray.700">
                    Buat Laporan Baru
                  </Heading>
                  
                  <Text fontSize="sm" color="gray.600">
                    Pilih format laporan yang ingin dibuat:
                  </Text>
                  
                  <HStack spacing={4}>
                    <Button
                      colorScheme="blue"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handleGenerateReport('pdf')}
                      isLoading={loading}
                      loadingText="Membuat PDF..."
                      isDisabled={!inspection}
                    >
                      Buat Laporan PDF
                    </Button>
                    
                    <Button
                      colorScheme="green"
                      leftIcon={<DownloadIcon />}
                      onClick={() => handleGenerateReport('docx')}
                      isLoading={loading}
                      loadingText="Membuat DOCX..."
                      isDisabled={!inspection}
                    >
                      Buat Laporan DOCX
                    </Button>
                  </HStack>
                  
                  {!inspection && (
                    <Alert status="warning">
                      <AlertIcon />
                      <AlertTitle>Inspeksi Belum Dipilih</AlertTitle>
                      <AlertDescription>
                        Silakan pilih inspeksi terlebih dahulu untuk membuat laporan.
                      </AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Existing Reports */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md" color="gray.700">
                    Laporan yang Telah Dibuat
                  </Heading>
                  
                  {reports && reports.length > 0 ? (
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>ID</Th>
                            <Th>Judul</Th>
                            <Th>Tanggal Dibuat</Th>
                            <Th>Status</Th>
                            <Th>Aksi</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {reports.map((report) => (
                            <Tr key={report.id}>
                              <Td>
                                <Text fontWeight="bold">#{report.id}</Text>
                              </Td>
                              <Td>
                                <Text fontSize="sm" fontWeight="semibold">
                                  {report.title}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Format: {report.file_type?.toUpperCase() || 'PDF'}
                                </Text>
                              </Td>
                              <Td>
                                <Text fontSize="sm">
                                  {report.created_at 
                                    ? new Date(report.created_at).toLocaleDateString('id-ID')
                                    : '-'}
                                </Text>
                              </Td>
                              <Td>
                                <Badge colorScheme={getStatusColor(report.status)}>
                                  {report.status?.replace(/_/g, ' ') || 'draft'}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="Lihat Laporan">
                                    <IconButton
                                      icon={<ViewIcon />}
                                      size="sm"
                                      colorScheme="blue"
                                      onClick={() => handleViewReport(report)}
                                      aria-label="View report"
                                    />
                                  </Tooltip>
                                  <Tooltip label="Unduh Laporan">
                                    <IconButton
                                      icon={<DownloadIcon />}
                                      size="sm"
                                      colorScheme="green"
                                      onClick={() => handleDownloadReport(report)}
                                      aria-label="Download report"
                                    />
                                  </Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <Box flex="1">
                        <AlertTitle>Belum Ada Laporan</AlertTitle>
                        <AlertDescription>
                          Belum ada laporan yang dibuat untuk proyek ini.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Report Approval Workflow */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md" color="gray.700">
                    Alur Persetujuan Laporan
                  </Heading>
                  
                  <Tabs variant="soft-rounded" colorScheme="blue">
                    <TabList>
                      <Tab>Internal</Tab>
                      <Tab>Eksternal</Tab>
                      <Tab>Status</Tab>
                    </TabList>
                    
                    <TabPanels>
                      <TabPanel>
                        <VStack align="stretch" spacing={3}>
                          <Text fontSize="sm">
                            <strong>1. Project Lead Review</strong>
                            <br />
                            Memeriksa kelengkapan dan kesesuaian teknis laporan.
                          </Text>
                          
                          <Text fontSize="sm">
                            <strong>2. Head Consultant Approval</strong>
                            <br />
                            Memberikan persetujuan akhir sebelum laporan dikirim ke klien.
                          </Text>
                          
                          <Alert status="info" variant="subtle">
                            <AlertIcon />
                            <AlertDescription>
                              Laporan harus disetujui oleh Project Lead dan Head Consultant terlebih dahulu.
                            </AlertDescription>
                          </Alert>
                        </VStack>
                      </TabPanel>
                      
                      <TabPanel>
                        <VStack align="stretch" spacing={3}>
                          <Text fontSize="sm">
                            <strong>3. Klien Approval</strong>
                            <br />
                            Klien menyetujui/menolak laporan final sebelum dikirim ke pemerintah.
                          </Text>
                          
                          <Text fontSize="sm">
                            <strong>4. Government Submission</strong>
                            <br />
                            Setelah disetujui klien, laporan dikirim ke instansi pemerintah.
                          </Text>
                          
                          <Alert status="success" variant="subtle">
                            <AlertIcon />
                            <AlertDescription>
                              Laporan yang sudah disetujui klien siap untuk diajukan ke pemerintah.
                            </AlertDescription>
                          </Alert>
                        </VStack>
                      </TabPanel>
                      
                      <TabPanel>
                        <VStack align="stretch" spacing={3}>
                          <Text fontSize="sm">
                            <strong>Status Laporan Saat Ini:</strong>
                          </Text>
                          
                          <Badge colorScheme="blue" fontSize="md" p={2}>
                            {project?.status?.replace(/_/g, ' ') || 'draft'}
                          </Badge>
                          
                          <Text fontSize="xs" color="gray.500">
                            Terakhir diperbarui: {project?.updated_at 
                              ? new Date(project.updated_at).toLocaleString('id-ID') 
                              : '-'}
                          </Text>
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ReportForm;
