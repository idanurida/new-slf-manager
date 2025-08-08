import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Card, 
  CardBody, 
  Button, 
  VStack, 
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useToast
} from '@chakra-ui/react';
import DashboardLayout from '../../../../../../components/layouts/DashboardLayout';
import { useRouter } from 'next/router';

const ProjectDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  const handleScheduleInspection = () => {
    router.push(`/dashboard/project-lead/projects/${id}/inspections`);
  };

  const handleViewReports = () => {
    router.push(`/dashboard/project-lead/projects/${id}/reports`);
  };

  const handleManagePayments = () => {
    router.push(`/dashboard/project-lead/projects/${id}/payments`);
  };

  return (
    <DashboardLayout>
      <Box p={6}>
        <Heading mb={6}>Detail Proyek #{id}</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Inspeksi</StatLabel>
                <StatNumber>5</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Laporan</StatLabel>
                <StatNumber>3</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Status</StatLabel>
                <StatNumber color="green.500">Aktif</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
        
        <Card mb={6}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Informasi Proyek</Heading>
              
              <Text>
                <strong>Nama Proyek:</strong> Gedung Kantor ABC
              </Text>
              
              <Text>
                <strong>Pemilik:</strong> PT XYZ
              </Text>
              
              <Text>
                <strong>Alamat:</strong> Jl. Merdeka No. 123, Jakarta
              </Text>
              
              <Text>
                <strong>Fungsi Bangunan:</strong> Gedung Kantor
              </Text>
              
              <Text>
                <strong>Jumlah Lantai:</strong> 10
              </Text>
            </VStack>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Aksi</Heading>
              
              <Button 
                colorScheme="blue" 
                onClick={handleScheduleInspection}
              >
                Jadwalkan Inspeksi
              </Button>
              
              <Button 
                colorScheme="green" 
                onClick={handleViewReports}
              >
                Lihat Laporan
              </Button>
              
              <Button 
                colorScheme="orange" 
                onClick={handleManagePayments}
              >
                Kelola Pembayaran
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default ProjectDetail;