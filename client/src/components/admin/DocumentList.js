// client/src/components/admin/DocumentList.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Badge,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Select,
  Input,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  DownloadIcon, 
  ViewIcon, 
  DeleteIcon, 
  ChevronDownIcon, 
  SearchIcon 
} from '@chakra-ui/icons';
import axios from 'axios';
import { formatBytes, formatDate } from '../../utils/helpers';

const DocumentList = ({ projectId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const toast = useToast();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchDocuments = async () => {
    if (!projectId || !token) return;
    
    try {
      setLoading(true);
      
      const response = await axios.get(`/api/admin/projects/${projectId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchTerm,
          type: typeFilter
        }
      });
      
      setDocuments(response.data.documents || response.data);
    } catch (error) {
      console.error('Fetch documents error:', error);
      toast({
        title: 'Gagal memuat dokumen',
        description: error.response?.data?.error || 'Terjadi kesalahan saat memuat dokumen',
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
    fetchDocuments();
  }, [projectId, token, searchTerm, typeFilter]);

  const handleViewDocument = (document) => {
    if (document.file_path) {
      window.open(`/uploads/${document.file_path}`, '_blank');
    } else {
      toast({
        title: 'File tidak tersedia',
        description: 'File dokumen tidak ditemukan',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const handleDownloadDocument = (document) => {
    if (document.file_path) {
      const link = document.createElement('a');
      link.href = `/uploads/${document.file_path}`;
      link.download = document.title || `document-${document.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: 'File tidak tersedia',
        description: 'File dokumen tidak ditemukan',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      return;
    }

    setDeleting(true);
    try {
      await axios.delete(`/api/admin/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Dokumen dihapus',
        description: 'Dokumen berhasil dihapus',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error('Delete document error:', error);
      toast({
        title: 'Gagal menghapus dokumen',
        description: error.response?.data?.error || 'Terjadi kesalahan saat menghapus dokumen',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setDeleting(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType?.includes('word')) return '📝';
    return '📁';
  };

  const getTypeColor = (type) => {
    const colors = {
      'SURAT_PERMOHONAN': 'blue',
      'AS_BUILT_DRAWINGS': 'green',
      'KRK': 'purple',
      'IMB_LAMA': 'orange',
      'SLF_LAMA': 'pink',
      'STATUS_TANAH': 'yellow',
      'FOTO_LOKASI': 'cyan',
      'QUOTATION': 'teal',
      'CONTRACT': 'red',
      'SPK': 'gray',
      'REPORT': 'blue',
      'TEKNIS_STRUKTUR': 'green',
      'TEKNIS_ARSITEKTUR': 'purple',
      'TEKNIS_UTILITAS': 'orange',
      'TEKNIS_SANITASI': 'pink',
      'BUKTI_TRANSFER': 'yellow',
      'INVOICE': 'cyan',
      'PAYMENT_RECEIPT': 'teal',
      'GOVERNMENT_APPROVAL': 'red',
      'SLF_FINAL': 'gray'
    };
    return colors[type] || 'gray';
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <Skeleton height="40px" width="200px" mb={6} />
          
          <HStack spacing={4} mb={6}>
            <Skeleton height="40px" width="200px" />
            <Skeleton height="40px" width="150px" />
          </HStack>
          
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th><Skeleton height="20px" width="100%" /></Th>
                  <Th><Skeleton height="20px" width="100%" /></Th>
                  <Th><Skeleton height="20px" width="100%" /></Th>
                  <Th><Skeleton height="20px" width="100%" /></Th>
                  <Th><Skeleton height="20px" width="100%" /></Th>
                </Tr>
              </Thead>
              <Tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Tr key={i}>
                    <Td><Skeleton height="30px" width="100%" /></Td>
                    <Td><Skeleton height="30px" width="100%" /></Td>
                    <Td><Skeleton height="30px" width="100%" /></Td>
                    <Td><Skeleton height="30px" width="100%" /></Td>
                    <Td><Skeleton height="30px" width="100%" /></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardBody>
          <Alert status="info">
            <AlertIcon />
            <AlertTitle>Belum ada dokumen</AlertTitle>
            <AlertDescription>
              Tidak ada dokumen yang ditemukan untuk proyek ini.
            </AlertDescription>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" color="blue.600">
                Daftar Dokumen
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Total: {documents.length} dokumen
              </Text>
            </Box>

            <Divider />

            {/* Filters */}
            <HStack spacing={4} wrap="wrap">
              <InputGroup width={{ base: '100%', md: '250px' }}>
                <InputLeftElement pointerEvents='none'>
                  <SearchIcon color='gray.300' />
                </InputLeftElement>
                <Input
                  placeholder="Cari dokumen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Select
                placeholder="Filter berdasarkan jenis"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                width={{ base: '100%', md: '200px' }}
              >
                {[
                  'SURAT_PERMOHONAN',
                  'AS_BUILT_DRAWINGS',
                  'KRK',
                  'IMB_LAMA',
                  'SLF_LAMA',
                  'STATUS_TANAH',
                  'FOTO_LOKASI',
                  'QUOTATION',
                  'CONTRACT',
                  'SPK',
                  'REPORT',
                  'TEKNIS_STRUKTUR',
                  'TEKNIS_ARSITEKTUR',
                  'TEKNIS_UTILITAS',
                  'TEKNIS_SANITASI',
                  'BUKTI_TRANSFER',
                  'INVOICE',
                  'PAYMENT_RECEIPT',
                  'GOVERNMENT_APPROVAL',
                  'SLF_FINAL'
                ].map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>

              {(searchTerm || typeFilter) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('');
                  }}
                  variant="outline"
                  colorScheme="red"
                >
                  Reset Filter
                </Button>
              )}
            </HStack>

            {/* Documents Table */}
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Dokumen</Th>
                    <Th>Jenis</Th>
                    <Th>Ukuran</Th>
                    <Th>Diunggah Oleh</Th>
                    <Th>Tanggal</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {documents.map((document) => (
                    <Tr key={document.id}>
                      <Td>
                        <HStack spacing={3}>
                          <Text fontSize="xl">{getFileIcon(document.file_type)}</Text>
                          <VStack align="stretch" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">
                              {document.title}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {document.description || '-'}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      
                      <Td>
                        <Badge colorScheme={getTypeColor(document.type)}>
                          {document.type.replace(/_/g, ' ')}
                        </Badge>
                      </Td>
                      
                      <Td>
                        <Text fontSize="sm">
                          {document.file_size ? formatBytes(document.file_size) : '-'}
                        </Text>
                      </Td>
                      
                      <Td>
                        <Text fontSize="sm">
                          {document.uploader?.name || 'Unknown'}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {document.uploader?.email || '-'}
                        </Text>
                      </Td>
                      
                      <Td>
                        <Text fontSize="sm">
                          {document.created_at ? formatDate(document.created_at) : '-'}
                        </Text>
                      </Td>
                      
                      <Td>
                        <Menu>
                          <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                            size="sm"
                            variant="outline"
                          >
                            Aksi
                          </MenuButton>
                          <MenuList>
                            <MenuItem 
                              icon={<ViewIcon />} 
                              onClick={() => handleViewDocument(document)}
                            >
                              Lihat Dokumen
                            </MenuItem>
                            <MenuItem 
                              icon={<DownloadIcon />} 
                              onClick={() => handleDownloadDocument(document)}
                            >
                              Unduh Dokumen
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem 
                              icon={<DeleteIcon />} 
                              color="red.500"
                              onClick={() => handleDeleteDocument(document.id)}
                              isDisabled={deleting}
                            >
                              Hapus Dokumen
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default DocumentList;
