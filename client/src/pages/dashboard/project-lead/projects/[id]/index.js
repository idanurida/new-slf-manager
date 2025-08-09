// client/src/pages/dashboard/project-lead/projects/[id]/index.js
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
  useToast,
  Skeleton, // ✅ Tambahkan Skeleton untuk loading state
  Alert, // ✅ Tambahkan Alert untuk error/not found
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
// ✅ Perbaiki path import menjadi relatif
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
// ✅ Mock data proyek berdasarkan ID untuk lingkungan mockup
const getMockProject = (id) => {
  const mockProjects = {
    '1': {
      id: '1',
      name: 'Gedung Kantor ABC',
      owner: 'PT XYZ',
      address: 'Jl. Merdeka No. 123, Jakarta',
      buildingFunction: 'Gedung Kantor',
      floors: 10,
      totalInspections: 5,
      totalReports: 3,
      status: 'Aktif',
      statusColor: 'green.500'
    },
    '2': {
      id: '2',
      name: 'Apartemen Sejahtera',
      owner: 'PT Properti Indah',
      address: 'Jl. Sudirman No. 456, Bandung',
      buildingFunction: 'Residensial',
      floors: 20,
      totalInspections: 8,
      totalReports: 6,
      status: 'Dalam Proses',
      statusColor: 'orange.500'
    },
    '3': {
      id: '3',
      name: 'Pabrik Baru',
      owner: 'CV Maju Terus',
      address: 'Jl. Industri No. 789, Surabaya',
      buildingFunction: 'Industri',
      floors: 3,
      totalInspections: 2,
      totalReports: 1,
      status: 'Selesai',
      statusColor: 'blue.500'
    }
  };
  return mockProjects[id] || null; // Kembalikan null jika tidak ditemukan
};

const ProjectDetail = ({ mockProjectData }) => { // ✅ Terima data mock sebagai props
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  // ✅ 1. Tangani router.isFallback jika menggunakan fallback: true/blocking di getStaticPaths
  if (router.isFallback) {
    return (
      <DashboardLayout>
        <Box p={6}>
          <Skeleton height="40px" width="200px" mb={6} />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardBody><Skeleton height="60px" /></CardBody></Card>
            ))}
          </SimpleGrid>
          <Card mb={6}>
            <CardBody>
              <Skeleton height="30px" width="150px" mb={4} />
              <VStack align="stretch">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} height="20px" />
                ))}
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Skeleton height="30px" width="100px" mb={4} />
              <VStack align="stretch">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height="40px" />
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </DashboardLayout>
    );
  }

  // ✅ 2. Tangani kasus jika id tidak ada di query (meskipun jarang terjadi di halaman dinamis)
  if (!id) {
    return (
      <DashboardLayout>
        <Box p={6}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Invalid Request</AlertTitle>
            <AlertDescription>Project ID is missing.</AlertDescription>
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  // ✅ 3. Tangani kasus jika data mock tidak diteruskan dan tidak ditemukan
  // (Ini akan terjadi jika getStaticProps mereturn notFound: true)
  if (!mockProjectData) {
    return (
      <DashboardLayout>
        <Box p={6}>
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>Project Not Found</AlertTitle>
            <AlertDescription>
              Project with ID {id} was not found in mock data.
            </AlertDescription>
            <Button mt={4} onClick={() => router.push('/dashboard/project-lead/projects')}>
              Back to Projects
            </Button>
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  // Gunakan data mock yang diteruskan
  const project = mockProjectData;

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
        <Heading mb={6}>Detail Proyek #{project.id} (Mock Mode)</Heading> {/* ✅ Tambahkan indikator mock */}
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Inspeksi</StatLabel>
                <StatNumber>{project.totalInspections}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Laporan</StatLabel>
                <StatNumber>{project.totalReports}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Status</StatLabel>
                <StatNumber color={project.statusColor}>{project.status}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
        
        <Card mb={6}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Informasi Proyek</Heading>
              
              <Text>
                <strong>Nama Proyek:</strong> {project.name}
              </Text>
              
              <Text>
                <strong>Pemilik:</strong> {project.owner}
              </Text>
              
              <Text>
                <strong>Alamat:</strong> {project.address}
              </Text>
              
              <Text>
                <strong>Fungsi Bangunan:</strong> {project.buildingFunction}
              </Text>
              
              <Text>
                <strong>Jumlah Lantai:</strong> {project.floors}
              </Text>
            </VStack>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Aksi (Mock)</Heading> {/* ✅ Tambahkan indikator mock */}
              
              <Button 
                colorScheme="blue" 
                onClick={handleScheduleInspection}
              >
                Jadwalkan Inspeksi (Mock)
              </Button>
              
              <Button 
                colorScheme="green" 
                onClick={handleViewReports}
              >
                Lihat Laporan (Mock)
              </Button>
              
              <Button 
                colorScheme="orange" 
                onClick={handleManagePayments}
              >
                Kelola Pembayaran (Mock)
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default ProjectDetail;

// ✅ 4. Tambahkan getStaticPaths untuk rute dinamis
export async function getStaticPaths() {
  // Daftar ID proyek mock yang ingin di-generate di build time
  const paths = [
    { params: { id: '1' } },
    { params: { id: '2' } },
    { params: { id: '3' } },
    // Tambahkan ID lain jika perlu
  ];

  return {
    paths,
    // fallback: false -> rute lain akan 404
    // fallback: 'blocking' -> rute lain akan di-render di server saat diminta
    // fallback: true -> rute lain akan menampilkan fallback UI (perlu penanganan isFallback)
    fallback: 'blocking' // atau 'false' atau true, sesuaikan kebutuhan
  };
}

// ✅ 5. Tambahkan getStaticProps untuk meneruskan data mock
export async function getStaticProps(context) {
  const { id } = context.params; // Dapatkan ID dari context

  // Dapatkan data mock berdasarkan ID
  const mockProjectData = getMockProject(id);

  // Jika data tidak ditemukan, return notFound
  if (!mockProjectData) {
    return {
      notFound: true,
      // props: {} // Atau kirim props kosong dan tangani di komponen
    };
  }

  // Kembalikan data mock sebagai props
  return {
    props: {
      mockProjectData, // Kirim data mock ke komponen
    },
    // revalidate: 60, // Opsional: untuk ISR
  };
}