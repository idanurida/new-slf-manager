// client/src/components/layouts/DashboardLayout.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  HStack,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';

// Mock data statis untuk testing frontend
const mockUsers = {
  superadmin: {
    id: 1,
    name: 'Super Admin Mock User',
    role: 'superadmin',
    email: 'superadmin@example.com'
  },
  head_consultant: {
    id: 2,
    name: 'Head Consultant Mock User',
    role: 'head_consultant',
    email: 'headconsultant@example.com'
  },
  project_lead: {
    id: 3,
    name: 'Project Lead Mock User',
    role: 'project_lead',
    email: 'projectlead@example.com'
  },
  admin_lead: {
    id: 4,
    name: 'Admin Lead Mock User',
    role: 'admin_lead',
    email: 'adminlead@example.com'
  },
  inspector: {
    id: 5,
    name: 'Inspector Mock User',
    role: 'inspector',
    email: 'inspector@example.com'
  },
  drafter: {
    id: 6,
    name: 'Drafter Mock User',
    role: 'drafter',
    email: 'drafter@example.com'
  },
  client: {
    id: 7,
    name: 'Client Mock User',
    role: 'client',
    email: 'client@example.com'
  }
};

const DashboardLayout = ({ children, user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user || null);
  const toast = useToast();

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
      setCurrentUser(mockUsers.project_lead);
      return;
    }

    // Jika di client-side, coba dapatkan role dari localStorage
    try {
      console.log('[DashboardLayout] CSR: Mencoba mendeteksi role dari localStorage');
      
      // 1. Coba dapatkan role yang disimpan secara eksplisit
      const storedRole = localStorage.getItem('mockUserRole');
      console.log('[DashboardLayout] Role dari mockUserRole:', storedRole);
      if (storedRole) {
        const mockUserForRole = mockUsers[storedRole];
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
          const mockUserForRole = mockUsers[roleFromToken];
          console.log('[DashboardLayout] User mock untuk role dari token:', mockUserForRole);
          setCurrentUser(mockUserForRole);
          return;
        }
      }

      // 3. Jika tidak ada token atau role, gunakan default
      console.log('[DashboardLayout] Tidak ada info role ditemukan, menggunakan default project_lead');
      setCurrentUser(mockUsers.project_lead);
    } catch (error) {
      console.error('[DashboardLayout] Error determining mock user role:', error);
      // Gunakan default jika terjadi error
      setCurrentUser(mockUsers.project_lead);
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

  const SidebarContent = () => (
    <VStack align="stretch">
      {/* Navigasi berdasarkan role */}
      {currentUser?.role === 'inspector' && (
        <HStack spacing={2}>
          <Text fontWeight="bold">Inspector Dashboard</Text>
          <Text fontSize="sm">(Mock)</Text>
        </HStack>
      )}
      {currentUser?.role === 'project_lead' && (
        <HStack spacing={2}>
          <Text fontWeight="bold">Project Lead Dashboard</Text>
          <Text fontSize="sm">(Mock)</Text>
        </HStack>
      )}
      {/* ... tambahkan navigasi untuk role lainnya */}
    </VStack>
  );

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
          <Text fontSize="xl" fontWeight="bold" mb={6} color="blue.600">
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
                key={router.asPath}
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