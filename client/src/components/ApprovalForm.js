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
  Badge
} from '@chakra-ui/react';
import axios from 'axios';

const ApprovalForm = ({ reportId, role, currentStatus, onApprovalChange }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleApprove = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let message = '';

      switch (role) {
        case 'project_lead':
          endpoint = `/api/approvals/reports/${reportId}/approve/project_lead`;
          message = 'Laporan disetujui oleh Project Lead';
          break;
        case 'head_consultant':
          endpoint = `/api/approvals/reports/${reportId}/approve/head_consultant`;
          message = 'Laporan disetujui oleh Head Consultant';
          break;
        case 'klien':
          endpoint = `/api/approvals/reports/${reportId}/approve/client`;
          message = 'Laporan disetujui oleh Klien';
          break;
        default:
          throw new Error('Role tidak valid');
      }

      await axios.post(endpoint, { comment });
      
      toast({
        title: 'Berhasil',
        description: message,
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      if (onApprovalChange) {
        onApprovalChange();
      }

      setComment('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal menyetujui laporan',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let message = '';

      switch (role) {
        case 'project_lead':
          endpoint = `/api/approvals/reports/${reportId}/reject/project_lead`;
          message = 'Laporan ditolak oleh Project Lead';
          break;
        case 'head_consultant':
          endpoint = `/api/approvals/reports/${reportId}/reject/head_consultant`;
          message = 'Laporan ditolak oleh Head Consultant';
          break;
        case 'klien':
          endpoint = `/api/approvals/reports/${reportId}/reject/client`;
          message = 'Laporan ditolak oleh Klien';
          break;
        default:
          throw new Error('Role tidak valid');
      }

      await axios.post(endpoint, { comment });
      
      toast({
        title: 'Berhasil',
        description: message,
        status: 'warning',
        duration: 3000,
        isClosable: true
      });

      if (onApprovalChange) {
        onApprovalChange();
      }

      setComment('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal menolak laporan',
        status: 'error',
        duration: 5000,
        isClosable: true
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
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Box>
            <Heading size="md">Persetujuan Internal</Heading>
            <Text fontSize="sm" color="gray.500">
              Role: <Badge colorScheme={getStatusColor(role)}>{role}</Badge>
            </Text>
            <Text fontSize="sm" color="gray.500">
              Status: <Badge colorScheme={getStatusColor(currentStatus)}>{currentStatus}</Badge>
            </Text>
          </Box>

          <FormControl>
            <FormLabel>Komentar (Opsional)</FormLabel>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Masukkan komentar..."
              minHeight="100px"
            />
          </FormControl>

          <HStack spacing={4} justify="flex-end">
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
  );
};

export default ApprovalForm;
