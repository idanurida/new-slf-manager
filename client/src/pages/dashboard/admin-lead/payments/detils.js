import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Card, 
  CardBody, 
  Button, 
  VStack, 
  HStack,
  useToast
} from '@chakra-ui/react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useRouter } from 'next/router';

const AdminPaymentDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  const handleVerifyPayment = async () => {
    try {
      // Logic verifikasi pembayaran
      toast({
        title: 'Pembayaran Diverifikasi',
        description: 'Pembayaran berhasil diverifikasi',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      router.push('/dashboard/admin-lead/payments');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memverifikasi pembayaran',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <DashboardLayout>
      <Box p={6}>
        <Heading mb={6}>Detail Pembayaran #{id}</Heading>
        
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold">
                Pembayaran Proyek Gedung Kantor ABC
              </Text>
              
              <Text>
                <strong>Jumlah:</strong> Rp 5.000.000
              </Text>
              
              <Text>
                <strong>Tanggal:</strong> 15 Juni 2024
              </Text>
              
              <Text>
                <strong>Status:</strong> Menunggu Verifikasi
              </Text>
              
              <HStack spacing={4} mt={6}>
                <Button colorScheme="green" onClick={handleVerifyPayment}>
                  Verifikasi Pembayaran
                </Button>
                
                <Button colorScheme="red">
                  Tolak Pembayaran
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AdminPaymentDetail;
