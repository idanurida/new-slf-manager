// client/src/pages/dashboard/admin-lead/payments/details.js
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
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link as ChakraLink
} from '@chakra-ui/react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useRouter } from 'next/router';
import NextLink from 'next/link'; // Untuk navigasi internal Next.js

// Mock user untuk konsistensi
const mockUser = {
  id: 1,
  name: 'Admin Lead Mock User',
  role: 'admin_lead',
  email: 'admin.lead@example.com'
};

// Mock data statis untuk halaman ini (karena ini bukan dynamic route)
// Bisa berisi informasi umum atau contoh
const mockStaticPaymentInfo = {
  description: "Halaman ini menunjukkan informasi umum tentang manajemen pembayaran. Untuk melihat detail pembayaran spesifik, gunakan tautan di bawah.",
  examplePayments: [
    { id: '1', name: 'Pembayaran Proyek Alpha' },
    { id: '2', name: 'Pembayaran Proyek Beta' }
  ]
};

const AdminPaymentStaticDetails = () => {
  const router = useRouter();
  const toast = useToast();

  const handleExampleAction = (actionName) => {
    // Mock action tanpa API
    console.log(`Mock action: ${actionName}`);
    toast({
      title: `Aksi ${actionName} (Mock)`,
      description: `Aksi ${actionName} berhasil dijalankan dalam mode mock.`,
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  return (
    <DashboardLayout user={mockUser}>
      <Box p={6}>
        <Heading mb={6} color="blue.600">Manajemen Pembayaran</Heading>
        
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Informasi Umum</AlertTitle>
            <AlertDescription>
              {mockStaticPaymentInfo.description}
            </AlertDescription>
          </Box>
        </Alert>

        <Card mb={6}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Contoh Detail Pembayaran Spesifik</Heading>
              <Text>
                Klik tautan di bawah untuk melihat detail pembayaran berdasarkan ID:
              </Text>
              <VStack align="start" spacing={2}>
                {mockStaticPaymentInfo.examplePayments.map(payment => (
                  <ChakraLink
                    as={NextLink} // Gunakan NextLink untuk navigasi internal
                    href={`/dashboard/admin-lead/payments/${payment.id}`}
                    key={payment.id}
                    color="blue.500"
                  >
                    {payment.name} (ID: {payment.id})
                  </ChakraLink>
                ))}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Aksi Umum (Contoh)</Heading>
              <Text>
                Tombol-tombol di bawah ini menunjukkan aksi umum yang tersedia untuk manajemen pembayaran.
              </Text>
              
              <HStack spacing={4}>
                <Button 
                  colorScheme="blue" 
                  onClick={() => handleExampleAction('Lihat Semua Pembayaran')}
                >
                  Lihat Semua Pembayaran
                </Button>
                
                <Button 
                  colorScheme="green" 
                  onClick={() => handleExampleAction('Unggah Bukti Pembayaran')}
                >
                  Unggah Bukti Pembayaran
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AdminPaymentStaticDetails;

// Tidak perlu getStaticProps/getStaticPaths karena ini bukan dynamic route
export async function getStaticProps() {
  return {
    props: {} // Atau props statis jika diperlukan
  };
}