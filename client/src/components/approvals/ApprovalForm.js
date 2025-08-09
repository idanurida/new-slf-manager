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
// Hapus import axios
// import axios from 'axios';

const ApprovalForm = ({ reportId, role, currentStatus, onApprovalChange }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Fungsi mock untuk menyetujui laporan
  const handleApprove = async () => {
    setLoading(true);
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buat data mock untuk response
      const mockResponse = {
        data: {
          message: 'Laporan berhasil disetujui (Mock)',
          approval: {
            id: Math.floor(Math.random() * 1000),
            report_id: reportId,
            role: role,
            status: 'approved',
            comment: comment,
            approved_at: new Date().toISOString(),
            approved_by: 'Mock User'
          }
        }
      };
      
      toast({
        title: 'Laporan Disetujui',
        description: mockResponse.data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      // Panggil callback dengan data mock jika disediakan
      if (onApprovalChange) {
        onApprovalChange(mockResponse.data.approval);
      }
    } catch (error) {
      console.error('Approval error (Mock):', error);
      toast({
        title: 'Error',
        description: 'Gagal menyetujui laporan (Mock)',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fungsi mock untuk menolak laporan
  const handleReject = async () => {
    setLoading(true);
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buat data mock untuk response
      const mockResponse = {
        data: {
          message: 'Laporan berhasil ditolak (Mock)',
          approval: {
            id: Math.floor(Math.random() * 1000),
            report_id: reportId,
            role: role,
            status: 'rejected',
            comment: comment,
            rejected_at: new Date().toISOString(),
            rejected_by: 'Mock User'
          }
        }
      };
      
      toast({
        title: 'Laporan Ditolak',
        description: mockResponse.data.message,
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      // Panggil callback dengan data mock jika disediakan
      if (onApprovalChange) {
        onApprovalChange(mockResponse.data.approval);
      }
    } catch (error) {
      console.error('Rejection error (Mock):', error);
      toast({
        title: 'Error',
        description: 'Gagal menolak laporan (Mock)',
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
                Persetujuan Internal - {role.replace(/_/g, ' ')} (Mock Mode)
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
                  kesesuaian teknis laporan sebelum memberikan persetujuan. (Mock Mode)
                </AlertDescription>
              </Box>
            </Alert>

            <FormControl>
              <FormLabel>Komentar (Opsional)</FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Masukkan komentar... (Mock)"
                minHeight="100px"
              />
            </FormControl>

            <HStack justifyContent="flex-end" spacing={4}>
              <Button
                colorScheme="red"
                onClick={handleReject}
                isLoading={loading}
                loadingText="Menolak... (Mock)"
                isDisabled={!reportId}
              >
                Tolak Laporan (Mock)
              </Button>
              
              <Button
                colorScheme="green"
                onClick={handleApprove}
                isLoading={loading}
                loadingText="Menyetujui... (Mock)"
                isDisabled={!reportId}
              >
                Setujui Laporan (Mock)
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ApprovalForm;