// client/src/components/approvals/ProjectLeadApproval.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge,
  Skeleton
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';

const ProjectLeadApproval = ({ report, projectId, inspectionId, onApprovalChange }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/approvals/reports/${report.id}/approve/project_lead`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast({
        title: 'Berhasil',
        description: 'Laporan berhasil disetujui',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      if (onApprovalChange) {
        onApprovalChange(response.data);
      }

      // Redirect ke dashboard setelah approve
      router.push(`/dashboard/project-lead/projects/${projectId}`);

    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal menyetujui laporan',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/approvals/reports/${report.id}/reject/project_lead`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast({
        title: 'Berhasil',
        description: 'Laporan berhasil ditolak',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      if (onApprovalChange) {
        onApprovalChange(response.data);
      }

      // Redirect ke dashboard setelah reject
      router.push(`/dashboard/project-lead/projects/${projectId}`);

    } catch (error) {
      console.error('Rejection error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal menolak laporan',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!report) {
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
              <Skeleton height="20px" width="300px" />
              <Skeleton height="100px" />
              <HStack spacing={4}>
                <Skeleton height="40px" width="120px" />
                <Skeleton height="40px" width="120px" />
              </HStack>
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
            <Box>
              <Heading size="md" color="blue.600">
                Persetujuan Project Lead
              </Heading>
              <Text fontSize="sm" color="gray.600" mt={2}>
                Silakan tinjau dan berikan persetujuan untuk laporan ini
              </Text>
            </Box>

            <Divider />

            <Box>
              <Heading size="sm" mb={2}>
                Informasi Laporan
              </Heading>
              <VStack align="stretch" spacing={2}>
                <Text>
                  <strong>ID Laporan:</strong> {report.id}
                </Text>
                <Text>
                  <strong>Judul:</strong> {report.title}
                </Text>
                <Text>
                  <strong>Proyek:</strong> {report.project?.name}
                </Text>
                <Text>
                  <strong>Status Saat Ini:</strong>{' '}
                  <Badge colorScheme="yellow">{report.status?.replace(/_/g, ' ')}</Badge>
                </Text>
              </VStack>
            </Box>

            <Alert status="info">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Perhatian!</AlertTitle>
                <AlertDescription>
                  Sebagai Project Lead, Anda bertanggung jawab untuk memeriksa kelengkapan 
                  dan kesesuaian teknis laporan sebelum memberikan persetujuan.
                </AlertDescription>
              </Box>
            </Alert>

            <FormControl>
              <FormLabel>Komentar (Opsional)</FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Masukkan komentar atau catatan..."
                minHeight="100px"
                isDisabled={loading}
              />
            </FormControl>

            <HStack justify="flex-end" spacing={4}>
              <Button
                colorScheme="red"
                onClick={handleReject}
                isLoading={loading}
                loadingText="Menolak..."
                isDisabled={!report.id}
              >
                Tolak Laporan
              </Button>
              
              <Button
                colorScheme="green"
                onClick={handleApprove}
                isLoading={loading}
                loadingText="Menyetujui..."
                isDisabled={!report.id}
              >
                Setujui Laporan
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ProjectLeadApproval;
