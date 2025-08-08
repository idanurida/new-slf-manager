// client/src/pages/dashboard/admin-lead/documents.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useToast,
  Divider,
  Button
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import DocumentUpload from '../../../components/admin/DocumentUpload';
import DocumentList from '../../../components/admin/DocumentList';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';

const AdminLeadDocuments = () => {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    totalDocuments: 0,
    pendingVerification: 0,
    verifiedDocuments: 0,
    rejectedDocuments: 0
  });
  const toast = useToast();
  const router = useRouter();
  const { projectId } = router.query;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const {  userData } = useQuery(
    'user',
    async () => {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    },
    { 
      enabled: !!token,
      onSuccess: (data) => setUser(data.user)
    }
  );

  const {  statsData, refetch: refetchStats } = useQuery(
    'admin-document-stats',
    async () => {
      const response = await axios.get('/api/admin/documents/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.stats;
    },
    { 
      enabled: !!token,
      onSuccess: (data) => setStats(data)
    }
  );

  const handleUploadSuccess = (document) => {
    toast({
      title: 'Dokumen berhasil diunggah',
      description: `Dokumen "${document.title}" telah berhasil diunggah`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
    
    // Refresh stats
    refetchStats();
  };

  return (
    <DashboardLayout user={user}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">
          Manajemen Dokumen
        </Heading>
        
        <Text fontSize="lg" color="gray.600" mb={8}>
          Upload dan kelola dokumen terkait proyek SLF
        </Text>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Dokumen</StatLabel>
                <StatNumber color="blue.500">{stats.totalDocuments}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Menunggu Verifikasi</StatLabel>
                <StatNumber color="yellow.500">{stats.pendingVerification}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Diverifikasi</StatLabel>
                <StatNumber color="green.500">{stats.verifiedDocuments}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Ditolak</StatLabel>
                <StatNumber color="red.500">{stats.rejectedDocuments}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Divider mb={8} />

        {/* Document Upload Section */}
        <Card mb={8}>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">
              Upload Dokumen Baru
            </Heading>
            <DocumentUpload 
              projectId={projectId}
              onUploadSuccess={handleUploadSuccess}
            />
          </CardBody>
        </Card>

        <Divider mb={8} />

        {/* Document List Section */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">
              Daftar Dokumen Proyek
            </Heading>
            <DocumentList projectId={projectId} />
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AdminLeadDocuments;
