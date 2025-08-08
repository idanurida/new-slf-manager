// client/src/components/reports/ProjectLeadApprovalForm.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Card,
  CardBody,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';

const ProjectLeadApprovalForm = ({ reportId, onApprovalChange }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `/api/approvals/reports/${reportId}/approve/project_lead`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast({
        title: "Laporan Disetujui",
        description: "Laporan telah disetujui oleh Project Lead.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      if (onApprovalChange) {
        onApprovalChange(response.data);
      }
      
      router.push('/dashboard/project-lead');
    } catch (err) {
      console.error("Approval error:", err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Gagal menyetujui laporan.",
        status: "error",
        duration: 5000,
        isClosable: true,
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
        `/api/approvals/reports/${reportId}/reject/project_lead`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast({
        title: "Laporan Ditolak",
        description: "Laporan telah ditolak oleh Project Lead.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      
      if (onApprovalChange) {
        onApprovalChange(response.data);
      }
      
      router.push('/dashboard/project-lead');
    } catch (err) {
      console.error("Rejection error:", err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Gagal menolak laporan.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Heading size="md" color="blue.600">
            Persetujuan Internal - Project Lead
          </Heading>
          
          <Alert status="info">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Perhatian!</AlertTitle>
              <AlertDescription display="block">
                Sebagai Project Lead, Anda bertanggung jawab untuk memeriksa kelengkapan dan 
                kesesuaian teknis laporan sebelum disetujui. Pastikan semua checklist telah 
                diisi dengan benar dan sesuai regulasi.
              </AlertDescription>
            </Box>
          </Alert>
          
          <Text fontSize="lg">
            Silakan berikan komentar dan tentukan persetujuan untuk laporan ini.
          </Text>

          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel htmlFor="comment">Komentar (Opsional)</FormLabel>
              <Textarea
                id="comment"
                placeholder="Masukkan komentar..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                minHeight="120px"
              />
            </FormControl>

            <HStack justifyContent="flex-end" spacing={4}>
              <Button
                colorScheme="red"
                mr={3}
                onClick={handleReject}
                isLoading={loading}
                loadingText="Menolak..."
              >
                Tolak Laporan
              </Button>
              
              <Button
                colorScheme="green"
                onClick={handleApprove}
                isLoading={loading}
                loadingText="Menyetujui..."
              >
                Setujui Laporan
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ProjectLeadApprovalForm;
