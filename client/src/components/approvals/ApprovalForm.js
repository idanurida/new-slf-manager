// client/src/components/approvals/ApprovalForm.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Card,
  CardBody,
  HStack,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';

const ApprovalForm = ({ reportId, role, currentStatus, onApprovalChange }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `/api/approvals/reports/${reportId}/approve/${role}`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast({
        title: 'Laporan Disetujui',
        description: response.data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      if (onApprovalChange) {
        onApprovalChange(response.data.approval);
      }
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
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `/api/approvals/reports/${reportId}/reject/${role}`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast({
        title: 'Laporan Ditolak',
        description: response.data.message,
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      if (onApprovalChange) {
        onApprovalChange(response.data.approval);
      }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
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
                Persetujuan Internal - {role.replace(/_/g, ' ')}
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Status saat ini: <Badge colorScheme={getStatusColor(currentStatus)}>{currentStatus || 'pending'}</Badge>
              </Text>
            </Box>

            <Divider />

            <Alert status="info">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Perhatian!</AlertTitle>
                <AlertDescription display="block">
                  Sebagai {role.replace(/_/g, ' ')}, Anda bertanggung jawab untuk memeriksa kelengkapan dan 
                  kesesuaian teknis laporan sebelum memberikan persetujuan.
                </AlertDescription>
              </Box>
            </Alert>

            <FormControl>
              <FormLabel>Komentar (Opsional)</FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Masukkan komentar..."
                minHeight="100px"
              />
            </FormControl>

            <HStack justifyContent="flex-end" spacing={4}>
              <Button
                colorScheme="red"
                onClick={handleReject}
                isLoading={loading}
                loadingText="Menolak..."
                isDisabled={!reportId}
              >
                Tolak Laporan
              </Button>
              
              <Button
                colorScheme="green"
                onClick={handleApprove}
                isLoading={loading}
                loadingText="Menyetujui..."
                isDisabled={!reportId}
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

export default ApprovalForm;
