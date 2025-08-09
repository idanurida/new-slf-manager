// client/src/pages/dashboard/admin-lead/payments/[id].js
import React, { useState, useEffect } from 'react';
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
  Image,
  SimpleGrid
} from '@chakra-ui/react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useRouter } from 'next/router';

// Mock data berdasarkan ID
const getMockPayment = (id) => {
  const mockPayments = {
    '1': {
      id: '1',
      amount: 5000000,
      payment_date: '2023-06-15T10:30:00Z',
      due_date: '2023-06-30T23:59:59Z',
      status: 'pending',
      notes: 'Pembayaran tahap 1',
      proof_file_path: null,
      project: {
        name: 'Mock Project Alpha',
        owner_name: 'PT. Bangun Jaya'
      }
    },
    '2': {
      id: '2',
      amount: 10000000,
      payment_date: '2023-07-01T14:20:00Z',
      due_date: '2023-07-15T23:59:59Z',
      status: 'verified',
      notes: 'Pembayaran lunas',
      proof_file_path: 'payment_proof_2.jpg',
      project: {
        name: 'Mock Project Beta',
        owner_name: 'CV. Maju Terus'
      }
    }
  };
  return mockPayments[id] || null;
};

// Mock user
const mockUser = {
  id: 1,
  name: 'Admin Lead Mock User',
  role: 'admin_lead',
  email: 'admin.lead@example.com'
};

// Mock format functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID');
};

const PaymentDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [payment, setPayment] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (id) {
      const mockPayment = getMockPayment(id);
      setPayment(mockPayment);
      if (mockPayment) {
        setVerificationNotes(mockPayment.notes || '');
      }
    }
  }, [id]);

  const handleVerifyPayment = () => {
    if (!payment) return;
    
    // Mock verification
    console.log('Mock verifying payment:', payment.id);
    toast({
      title: 'Pembayaran Diverifikasi',
      description: 'Pembayaran berhasil diverifikasi (mock)',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
    
    // Redirect ke halaman daftar pembayaran
    setTimeout(() => {
      router.push('/dashboard/admin-lead/payments');
    }, 1500);
  };

  const handleRejectPayment = () => {
    if (!payment) return;
    
    const reason = prompt('Masukkan alasan penolakan:');
    if (reason) {
      // Mock rejection
      console.log('Mock rejecting payment:', payment.id, reason);
      toast({
        title: 'Pembayaran Ditolak',
        description: 'Pembayaran berhasil ditolak (mock)',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      // Redirect ke halaman daftar pembayaran
      setTimeout(() => {
        router.push('/dashboard/admin-lead/payments');
      }, 1500);
    }
  };

  const statusColors = {
    pending: 'yellow',
    verified: 'green',
    rejected: 'red'
  };

  // Handle fallback state
  if (router.isFallback || !id) {
    return (
      <DashboardLayout user={mockUser}>
        <Box p={6}>
          <Text>Loading...</Text>
        </Box>
      </DashboardLayout>
    );
  }

  if (!payment) {
    return (
      <DashboardLayout user={mockUser}>
        <Box p={6}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Pembayaran Tidak Ditemukan</AlertTitle>
            <AlertDescription>
              Pembayaran dengan ID {id} tidak ditemukan.
            </AlertDescription>
            <Button 
              mt={4} 
              onClick={() => router.push('/dashboard/admin-lead/payments')}
            >
              Kembali ke Daftar Pembayaran
            </Button>
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={mockUser}>
      <Box p={6}>
        {/* Tombol kembali ke daftar pembayaran */}
        <HStack mb={4}>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => router.push('/dashboard/admin-lead/payments')}
          >
            ← Kembali ke Daftar Pembayaran
          </Button>
        </HStack>

        <Heading mb={6} color="blue.600">Detail Pembayaran #{payment.id}</Heading>
        
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
                  onClick={handleRejectPayment}
                >
                  Tolak Pembayaran
                </Button>
                
                <Button 
                  colorScheme="green" 
                  onClick={handleVerifyPayment}
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

export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: '1' } },
      { params: { id: '2' } },
    ],
    fallback: 'blocking'
  };
}

export async function getStaticProps() {
  return {
    props: {}
  };
}