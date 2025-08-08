// client/src/components/admin/PaymentVerification.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
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
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { formatCurrency, formatDate } from '../../utils/helpers';

const PaymentVerification = () => {
  const [user, setUser] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch user data
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

  // Fetch pending payments
  const { data: payments, isLoading, refetch } = useQuery(
    'pending-payments',
    async () => {
      const response = await axios.get('/api/admin/payments/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    { enabled: !!token && user?.role === 'admin_lead' }
  );

  // Fetch payment stats
  const { data: stats } = useQuery(
    'payment-stats',
    async () => {
      const response = await axios.get('/api/admin/payments/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.stats;
    },
    { enabled: !!token && user?.role === 'admin_lead' }
  );

  // Mutation for verifying payment
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
        queryClient.invalidateQueries('pending-payments');
        queryClient.invalidateQueries('payment-stats');
        onClose();
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

  // Mutation for rejecting payment
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
        queryClient.invalidateQueries('pending-payments');
        queryClient.invalidateQueries('payment-stats');
        onRejectClose();
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

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setVerificationNotes(payment.notes || '');
    onOpen();
  };

  const handleVerifyPayment = () => {
    if (!selectedPayment) return;
    verifyPaymentMutation.mutate({
      paymentId: selectedPayment.id,
      notes: verificationNotes
    });
  };

  const handleRejectPayment = () => {
    if (!selectedPayment || !rejectionReason.trim()) {
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
      paymentId: selectedPayment.id,
      rejection_reason: rejectionReason,
      notes: verificationNotes
    });
  };

  const statusColors = {
    pending: 'yellow',
    verified: 'green',
    rejected: 'red'
  };

  if (isLoading) {
    return (
      <Box p={6}>
        <Heading mb={6}>Verifikasi Pembayaran</Heading>
        <Skeleton height="40px" width="200px" mb={6} />
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="100px" borderRadius="md" />
          ))}
        </SimpleGrid>
        <Card>
          <CardBody>
            <Skeleton height="30px" width="150px" mb={4} />
            <VStack spacing={3}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="40px" width="100%" />
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6} color="blue.600">Verifikasi Pembayaran</Heading>
      
      {/* Stats Cards */}
      {stats && (
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Pembayaran</StatLabel>
                <StatNumber color="blue.500">{stats.totalPayments}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Menunggu Verifikasi</StatLabel>
                <StatNumber color="yellow.500">{stats.pendingPayments}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Diverifikasi</StatLabel>
                <StatNumber color="green.500">{stats.verifiedPayments}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Ditolak</StatLabel>
                <StatNumber color="red.500">{stats.rejectedPayments}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Pending Payments Table */}
      <Card>
        <CardBody>
          <Heading size="md" mb={4} color="gray.700">Pembayaran Menunggu Verifikasi</Heading>
          
          {payments && payments.length > 0 ? (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Proyek</Th>
                    <Th>Jumlah</Th>
                    <Th>Tanggal Pembayaran</Th>
                    <Th>Status</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {payments.map((payment) => (
                    <Tr key={payment.id}>
                      <Td>
                        <Text fontWeight="bold">{payment.project?.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {payment.project?.owner_name}
                        </Text>
                      </Td>
                      <Td>
                        {formatCurrency(payment.amount)}
                      </Td>
                      <Td>
                        {payment.payment_date 
                          ? formatDate(payment.payment_date) 
                          : '-'}
                      </Td>
                      <Td>
                        <Badge colorScheme={statusColors[payment.status] || 'gray'}>
                          {payment.status.replace(/_/g, ' ')}
                        </Badge>
                      </Td>
                      <Td>
                        <Button 
                          size="sm" 
                          colorScheme="blue"
                          onClick={() => handleViewPayment(payment)}
                        >
                          Verifikasi
                        </Button>
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
                <AlertTitle>Tidak ada pembayaran menunggu verifikasi!</AlertTitle>
                <AlertDescription>
                  Semua pembayaran sudah diproses.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* Verification Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Verifikasi Pembayaran</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPayment && (
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="md" color="blue.600">
                    {selectedPayment.project?.name}
                  </Heading>
                  <Text color="gray.500">
                    {selectedPayment.project?.owner_name}
                  </Text>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">Jumlah Pembayaran</Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      {formatCurrency(selectedPayment.amount)}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">Tanggal Pembayaran</Text>
                    <Text fontSize="md">
                      {selectedPayment.payment_date 
                        ? formatDate(selectedPayment.payment_date) 
                        : '-'}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">Tanggal Jatuh Tempo</Text>
                    <Text fontSize="md">
                      {selectedPayment.due_date 
                        ? formatDate(selectedPayment.due_date) 
                        : '-'}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">Status</Text>
                    <Badge colorScheme={statusColors[selectedPayment.status] || 'gray'}>
                      {selectedPayment.status.replace(/_/g, ' ')}
                    </Badge>
                  </Box>
                </SimpleGrid>

                {selectedPayment.proof_file_path && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Bukti Pembayaran</Text>
                    <Box
                      as="img"
                      src={`/uploads/${selectedPayment.proof_file_path}`}
                      alt="Bukti Pembayaran"
                      maxH="300px"
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
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button 
                colorScheme="red" 
                onClick={() => {
                  onClose();
                  onRejectOpen();
                }}
                isDisabled={verifyPaymentMutation.isLoading}
              >
                Tolak Pembayaran
              </Button>
              
              <Button 
                colorScheme="green" 
                onClick={handleVerifyPayment}
                isLoading={verifyPaymentMutation.isLoading}
                loadingText="Memverifikasi..."
                isDisabled={!selectedPayment}
              >
                Verifikasi Pembayaran
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rejection Modal */}
      <Modal isOpen={isRejectOpen} onClose={onRejectClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tolak Pembayaran</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPayment && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" color="red.600">
                    {selectedPayment.project?.name}
                  </Heading>
                  <Text color="gray.500">
                    {selectedPayment.project?.owner_name}
                  </Text>
                </Box>

                <Alert status="warning">
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>Peringatan!</AlertTitle>
                    <AlertDescription>
                      Anda akan menolak pembayaran ini. Pastikan alasan penolakan sudah jelas dan dapat dipahami oleh klien.
                    </AlertDescription>
                  </Box>
                </Alert>

                <FormControl isRequired>
                  <FormLabel>Alasan Penolakan</FormLabel>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Masukkan alasan penolakan yang jelas..."
                    minHeight="120px"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Catatan Tambahan</FormLabel>
                  <Textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Catatan tambahan (opsional)..."
                    minHeight="80px"
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button 
                variant="ghost" 
                onClick={onRejectClose}
                isDisabled={rejectPaymentMutation.isLoading}
              >
                Batal
              </Button>
              
              <Button 
                colorScheme="red" 
                onClick={handleRejectPayment}
                isLoading={rejectPaymentMutation.isLoading}
                loadingText="Menolak..."
                isDisabled={!rejectionReason.trim()}
              >
                Tolak Pembayaran
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PaymentVerification;
