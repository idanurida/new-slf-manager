// client/src/pages/dashboard/admin-lead/payments/[id].js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Image
} from '@chakra-ui/react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import { formatCurrency, formatDate } from '../../../../utils/helpers';

const PaymentDetail = () => {
  const [user, setUser] = useState({});
  const [payment, setPayment] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;

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

  const {  paymentData } = useQuery(
    ['payment', id],
    async () => {
      if (!id) return null;
      const response = await axios.get(`/api/admin/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    { 
      enabled: !!token && !!id,
      onSuccess: (data) => {
        setPayment(data);
        setVerificationNotes(data.notes || '');
      }
    }
  );

  const verifyPaymentMutation = useMutation(
    async ({ paymentId, notes }) => {
      const response = await axios.put(
        `/api/admin/payments/${paymentId}/verify`,
        { notes },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast({
          title: 'Pembayaran Diverifikasi',
          description: data.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        queryClient.invalidateQueries(['payment', id]);
        queryClient.invalidateQueries('pending-payments');
        queryClient.invalidateQueries('admin-stats');
        router.push('/dashboard/admin-lead');
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Gagal memverifikasi pembayaran',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      }
    }
  );

  const rejectPaymentMutation = useMutation(
    async ({ paymentId, rejection_reason, notes }) => {
      const response = await axios.put(
        `/api/admin/payments/${paymentId}/reject`,
        { rejection_reason, notes },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast({
          title: 'Pembayaran Ditolak',
          description: data.message,
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        queryClient.invalidateQueries(['payment', id]);
        queryClient.invalidateQueries('pending-payments');
        queryClient.invalidateQueries('admin-stats');
        router.push('/dashboard/admin-lead');
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Gagal menolak pembayaran',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      }
    }
  );

  const handleVerifyPayment = () => {
    if (!payment) return;
    verifyPaymentMutation.mutate({
      paymentId: payment.id,
      notes: verificationNotes
    });
  };

  const handleRejectPayment = () => {
    if (!payment || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Alasan penolakan wajib diisi',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }
    
    rejectPaymentMutation.mutate({
      paymentId: payment.id,
      rejection_reason: rejectionReason,
      notes: verificationNotes
    });
  };

  const statusColors = {
    pending: 'yellow',
    verified: 'green',
    rejected: 'red'
  };

  if (!payment) {
    return (
      <DashboardLayout user={user}>
        <Box p={6}>
          <Text>Loading...</Text>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">Detail Pembayaran</Heading>
        
        <Card mb={6}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" color="blue.600">
                  {payment.project?.name}
                </Heading>
                <Text color="gray.500">
                  {payment.project?.owner_name}
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Jumlah Pembayaran</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.600">
                    {formatCurrency(payment.amount)}
                  </Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Tanggal Pembayaran</Text>
                  <Text fontSize="md">
                    {payment.payment_date 
                      ? formatDate(payment.payment_date) 
                      : '-'}
                  </Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Tanggal Jatuh Tempo</Text>
                  <Text fontSize="md">
                    {payment.due_date 
                      ? formatDate(payment.due_date) 
                      : '-'}
                  </Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Status</Text>
                  <Badge colorScheme={statusColors[payment.status] || 'gray'}>
                    {payment.status.replace(/_/g, ' ')}
                  </Badge>
                </Box>
              </SimpleGrid>

              {payment.proof_file_path && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Bukti Pembayaran</Text>
                  <Image
                    src={`/uploads/${payment.proof_file_path}`}
                    alt="Bukti Pembayaran"
                    maxH="400px"
                    objectFit="contain"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={2}
                  />
                </Box>
              )}

              <FormControl>
                <FormLabel>Catatan Verifikasi</FormLabel>
                <Textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Masukkan catatan verifikasi..."
                  minHeight="100px"
                />
              </FormControl>

              <HStack justifyContent="flex-end" spacing={4}>
                <Button 
                  colorScheme="red" 
                  onClick={() => {
                    if (window.confirm('Apakah Anda yakin ingin menolak pembayaran ini?')) {
                      const reason = prompt('Masukkan alasan penolakan:');
                      if (reason) {
                        setRejectionReason(reason);
                        handleRejectPayment();
                      }
                    }
                  }}
                  isDisabled={verifyPaymentMutation.isLoading || rejectPaymentMutation.isLoading}
                >
                  Tolak Pembayaran
                </Button>
                
                <Button 
                  colorScheme="green" 
                  onClick={handleVerifyPayment}
                  isLoading={verifyPaymentMutation.isLoading}
                  loadingText="Memverifikasi..."
                  isDisabled={!payment}
                >
                  Verifikasi Pembayaran
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Alert status="info">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Perhatian!</AlertTitle>
            <AlertDescription>
              Pastikan Anda telah memverifikasi bukti pembayaran dengan benar sebelum melakukan verifikasi.
              Jika pembayaran ditolak, klien akan menerima notifikasi untuk melakukan pembayaran ulang.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    </DashboardLayout>
  );
};

export default PaymentDetail;