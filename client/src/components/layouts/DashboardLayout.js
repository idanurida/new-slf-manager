// client/src/components/layouts/DashboardLayout.js
import {
  Box,
  Flex,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  HStack,
  useToast // Tambahkan useToast untuk debugging jika diperlukan
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiFolder, FiUsers, FiFileText, FiCheckCircle, FiUser, FiFile, FiBarChart2, FiDollarSign } from 'react-icons/fi';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Fungsi utilitas untuk mengekstrak role dari token mock
const extractRoleFromMockToken = (token) => {
  if (!token || !token.startsWith('mock-jwt-')) {
    console.warn('Token tidak valid atau tidak sesuai format mock:', token);
    return null;
  }
  // Ubah 'mock-jwt-project_lead' menjadi 'project_lead'
  const extractedRole = token.replace('mock-jwt-', '').toLowerCase();
  console.log(`[Mock Auth] Role diekstrak dari token: ${extractedRole}`);
  return extractedRole;
};

// Mock user data untuk frontend testing
const getMockUserByRole = (role) => {
  console.log(`[Mock Auth] Mencari mock user untuk role: ${role}`);
  const mockUsers = {
    superadmin: {
      id: 1,
      name: 'Super Admin Mock',
      email: 'superadmin@mock.com',
      role: 'superadmin',
      avatar: null
    },
    head_consultant: {
      id: 7,
      name: 'Head Consultant Mock',
      email: 'head.consultant@mock.com',
      role: 'head_consultant',
      avatar: null
    },
    project_lead: {
      id: 2,
      name: 'Project Lead Mock',
      email: 'project.lead@mock.com',
      role: 'project_lead',
      avatar: null
    },
    admin_lead: {
      id: 3,
      name: 'Admin Lead Mock',
      email: 'admin.lead@mock.com',
      role: 'admin_lead',
      avatar: null
    },
    inspector: {
      id: 4,
      name: 'Inspector Mock',
      email: 'inspector@mock.com',
      role: 'inspector',
      avatar: null
    },
    drafter: {
      id: 5,
      name: 'Drafter Mock',
      email: 'drafter@mock.com',
      role: 'drafter',
      avatar: null
    },
    client: {
      id: 6,
      name: 'Client Mock',
      email: 'client@mock.com',
      role: 'client',
      avatar: null
    }
  };
  
  const user = mockUsers[role] || mockUsers.project_lead; // Default ke project_lead jika role tidak ditemukan
  console.log(`[Mock Auth] Mock user ditemukan:`, user);
  return user;
};

const DashboardLayout = ({ children, user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user || null);
  const toast = useToast(); // Untuk debugging jika diperlukan

  // Untuk frontend testing, kita akan menggunakan mock user data
  useEffect(() => {
    console.log('[DashboardLayout] useEffect dipicu');
    
    // Jika user sudah disediakan sebagai prop, gunakan itu
    if (user) {
      console.log('[DashboardLayout] User diterima sebagai props:', user);
      setCurrentUser(user);
      return;
    }

    // Jika kita sedang di server-side (SSR), gunakan default mock user
    if (typeof window === 'undefined') {
      console.log('[DashboardLayout] SSR: Menggunakan user default project_lead');
      setCurrentUser(getMockUserByRole('project_lead'));
      return;
    }

    // Jika di client-side, coba dapatkan role dari localStorage
    try {
      console.log('[DashboardLayout] CSR: Mencoba mendeteksi role dari localStorage');
      
      // 1. Coba dapatkan role yang disimpan secara eksplisit
      const storedRole = localStorage.getItem('mockUserRole');
      console.log('[DashboardLayout] Role dari mockUserRole:', storedRole);
      if (storedRole) {
        const mockUserForRole = getMockUserByRole(storedRole);
        console.log('[DashboardLayout] User mock untuk role ditemukan:', mockUserForRole);
        setCurrentUser(mockUserForRole);
        return;
      }

      // 2. Jika tidak ada, coba ekstrak role dari token
      const token = localStorage.getItem('token');
      console.log('[DashboardLayout] Token ditemukan:', token);
      if (token) {
        const roleFromToken = extractRoleFromMockToken(token);
        console.log('[DashboardLayout] Role diekstrak dari token:', roleFromToken);
        if (roleFromToken) {
          // Simpan role yang diekstrak untuk penggunaan berikutnya
          localStorage.setItem('mockUserRole', roleFromToken);
          const mockUserForRole = getMockUserByRole(roleFromToken);
          console.log('[DashboardLayout] User mock untuk role dari token:', mockUserForRole);
          setCurrentUser(mockUserForRole);
          return;
        }
      }

      // 3. Jika tidak ada token atau role, gunakan default
      console.log('[DashboardLayout] Tidak ada info role ditemukan, menggunakan default project_lead');
      setCurrentUser(getMockUserByRole('project_lead'));
    } catch (error) {
      console.error('[DashboardLayout] Error determining mock user role:', error);
      // Gunakan default jika terjadi error
      setCurrentUser(getMockUserByRole('project_lead'));
    }
  }, [user]); // Bergantung pada prop `user`

  const handleLogout = () => {
    console.log('[Auth] Logout mock dipicu');
    // Untuk frontend testing, hanya redirect ke login
    // Kita tidak benar-benar menghapus token karena ini mock
    // Tapi kita bisa membersihkan localStorage untuk simulasi logout penuh
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('mockUserRole');
      console.log('[Auth] Token dan role mock dihapus dari localStorage');
    }
    router.push('/login');
  };

  const getSidebarItems = () => {
    // Pastikan currentUser ada sebelum mengakses properti `role`
    const role = currentUser?.role;
    console.log(`[Navigation] Membuat sidebar items untuk role: ${role}`);
    
    const items = {
      superadmin: [
        { name: 'Dashboard', path: '/dashboard/superadmin', icon: <FiHome /> },
        { name: 'Users', path: '/dashboard/superadmin/users', icon: <FiUsers /> },
        { name: 'Projects', path: '/dashboard/superadmin/projects', icon: <FiFolder /> },
        { name: 'Regulations', path: '/dashboard/superadmin/regulations', icon: <FiFileText /> }
      ],
      head_consultant: [
        { name: 'Dashboard', path: '/dashboard/head-consultant', icon: <FiHome /> },
        { name: 'Projects', path: '/dashboard/head-consultant/projects', icon: <FiFolder /> },
        { name: 'Approvals', path: '/dashboard/head-consultant/approvals', icon: <FiCheckCircle /> }
      ],
      project_lead: [
        { name: 'Dashboard', path: '/dashboard/project-lead', icon: <FiHome /> },
        { name: 'My Projects', path: '/dashboard/projects', icon: <FiFolder /> },
        { name: 'Inspections', path: '/dashboard/project-lead/inspections', icon: <FiCheckCircle /> }
      ],
      admin_lead: [
        { name: 'Dashboard', path: '/dashboard/admin-lead', icon: <FiHome /> },
        { name: 'Projects', path: '/dashboard/projects', icon: <FiFolder /> },
        { name: 'Payments', path: '/dashboard/admin-lead/payments', icon: <FiDollarSign /> },
        { name: 'Documents', path: '/dashboard/admin-lead/documents', icon: <FiFile /> }
      ],
      inspector: [
        { name: 'Dashboard', path: '/dashboard/inspector', icon: <FiHome /> },
        { name: 'My Inspections', path: '/dashboard/inspector/inspections', icon: <FiCheckCircle /> },
        { name: 'Checklists', path: '/dashboard/inspector/checklists', icon: <FiFileText /> }
      ],
      drafter: [
        { name: 'Dashboard', path: '/dashboard/drafter', icon: <FiHome /> },
        { name: 'Reports', path: '/dashboard/drafter/reports', icon: <FiFileText /> }
      ],
      client: [
        { name: 'Dashboard', path: '/dashboard/client', icon: <FiHome /> },
        { name: 'My Projects', path: '/dashboard/client/projects', icon: <FiFolder /> },
        { name: 'Documents', path: '/dashboard/client/documents', icon: <FiFile /> }
      ]
    };
    
    // Kembalikan item berdasarkan role, atau array kosong jika role tidak ditemukan
    const selectedItems = items[role] || [];
    console.log(`[Navigation] Items sidebar yang dipilih:`, selectedItems);
    return selectedItems;
  };

  const SidebarContent = () => (
    <VStack align="stretch" spacing={1}>
      {getSidebarItems().map((item) => (
        <MotionBox
          key={item.path}
          as="button"
          display="flex"
          alignItems="center"
          gap={3}
          px={4}
          py={3}
          borderRadius="md"
          fontWeight="medium"
          bg={router.pathname === item.path ? 'blue.600' : 'transparent'}
          color={router.pathname === item.path ? 'white' : 'gray.200'}
          _hover={{ bg: router.pathname === item.path ? 'blue.600' : 'rgba(255,255,255,0.08)' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            console.log(`[Navigation] Navigasi ke: ${item.path}`);
            router.push(item.path);
          }}
        >
          {item.icon}
          <Text>{item.name}</Text>
        </MotionBox>
      ))}
    </VStack>
  );

  // Tampilkan loading state sederhana jika currentUser belum siap
  // Ini penting untuk memastikan sidebar items dibuat dengan role yang benar
  if (!currentUser) {
    console.log('[DashboardLayout] Menampilkan state loading karena currentUser belum tersedia');
    return (
      <Flex h="100vh" justify="center" align="center">
        <Text>Loading dashboard...</Text>
      </Flex>
    );
  }

  return (
    <Flex h="100vh" direction="column">
      {/* Mobile Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bgGradient="linear(to-b, gray.900, gray.800, gray.700)" color="white">
          <DrawerCloseButton />
          <DrawerHeader fontSize="lg" fontWeight="bold" color="blue.300">
            SLF One Manager
          </DrawerHeader>
          <DrawerBody>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Flex flex={1}>
        {/* Desktop Sidebar */}
        <Box
          w={{ base: 0, md: '250px' }}
          bgGradient="linear(to-b, gray.900, gray.800, gray.700)"
          color="white"
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
          p={4}
        >
          <Text fontSize="xl" fontWeight="bold" mb={6} color="blue.300">
            SLF One Manager
          </Text>
          <SidebarContent />
        </Box>

        {/* Main Content */}
        <Flex flex={1} direction="column" overflow="hidden">
          {/* Top Navigation with Glassmorphism */}
          <MotionFlex
            as="nav"
            align="center"
            justify="space-between"
            px={4}
            py={3}
            position="sticky"
            top={0}
            zIndex={10}
            bg="rgba(255, 255, 255, 0.8)"
            backdropFilter="blur(12px)"
            borderBottom="1px solid rgba(255,255,255,0.3)"
            boxShadow="sm"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
              icon={<HamburgerIcon />}
              aria-label="Open menu"
              variant="outline"
              colorScheme="blue"
            />
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              SLF One Manager
            </Text>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                <HStack spacing={2}>
                  <Avatar size="sm" name={currentUser?.name} src={currentUser?.avatar} />
                  <Text display={{ base: 'none', md: 'block' }}>{currentUser?.name}</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem as="a" href="/profile">Profile</MenuItem>
                <MenuItem as="a" href="/settings">Settings</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </MotionFlex>

          {/* Page Content with Transition */}
          <Box flex={1} overflow="auto" p={{ base: 4, md: 6 }} bg="gray.50">
            <AnimatePresence mode="wait">
              <MotionBox
                key={router.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                {children}
              </MotionBox>
            </AnimatePresence>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;