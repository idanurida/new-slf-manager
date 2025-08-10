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
  MenuDivider, // Pastikan ini diimpor
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
  VStack
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
// --- Perbaiki Impor motion ---
import { motion, AnimatePresence } from 'framer-motion'; // Tambahkan AnimatePresence
import { useRouter } from 'next/router';
// -----------------------------

// --- Definisikan komponen motion dengan benar ---
const MotionBox = motion(Box);
const MotionFlex = motion(Flex); // Definisikan MotionFlex dengan benar
// -----------------------------

// Mock data statis untuk testing frontend dengan konsistensi email @mock.com
const mockUsers = {
  superadmin: {
    id: 1,
    name: 'Super Admin Mock User',
    role: 'superadmin',
    email: 'superadmin@mock.com'
  },
  head_consultant: {
    id: 2,
    name: 'Head Consultant Mock User',
    role: 'head_consultant',
    email: 'head.consultant@mock.com'
  },
  project_lead: {
    id: 3,
    name: 'Project Lead Mock User',
    role: 'project_lead',
    email: 'project.lead@mock.com'
  },
  admin_lead: {
    id: 4,
    name: 'Admin Lead Mock User',
    role: 'admin_lead',
    email: 'admin.lead@mock.com'
  },
  inspector: {
    id: 5,
    name: 'Inspector Mock User',
    role: 'inspector',
    email: 'inspector@mock.com'
  },
  drafter: {
    id: 6,
    name: 'Drafter Mock User',
    role: 'drafter',
    email: 'drafter@mock.com'
  },
  client: {
    id: 7,
    name: 'Client Mock User',
    role: 'client',
    email: 'client@mock.com'
  }
};

const DashboardLayout = ({ children, user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user || null);

  useEffect(() => {
    // Jika user sudah disediakan sebagai prop, gunakan itu
    if (user) {
      setCurrentUser(user);
      return;
    }

    // Jika kita sedang di server-side (SSR), gunakan default mock user
    if (typeof window === 'undefined') {
      setCurrentUser(mockUsers.project_lead);
      return;
    }

    // Jika di client-side, coba dapatkan role dari localStorage
    try {
      // 1. Coba dapatkan role yang disimpan secara eksplisit oleh halaman login
      const storedRole = localStorage.getItem('mockUserRole');
      if (storedRole && mockUsers[storedRole]) {
        setCurrentUser(mockUsers[storedRole]);
        return;
      }

      // 2. Jika tidak ada, gunakan default
      setCurrentUser(mockUsers.project_lead);
    } catch (error) {
      console.error('[DashboardLayout] Error determining mock user role:', error);
      // Gunakan default jika terjadi error
      setCurrentUser(mockUsers.project_lead);
    }
  }, [user]); // Bergantung pada prop `user`

  const handleLogout = () => {
    // Untuk frontend testing, hanya redirect ke login
    // Kita tidak benar-benar menghapus token karena ini mock
    // Tapi kita bisa membersihkan localStorage untuk simulasi logout penuh
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('mockUserRole');
    }
    router.push('/login');
  };

  const getSidebarItems = () => {
    const role = currentUser?.role;
    
    const items = {
      superadmin: [
        { name: 'Dashboard', path: '/dashboard/superadmin' },
        { name: 'Users', path: '/dashboard/superadmin/users' },
        { name: 'Projects', path: '/dashboard/superadmin/projects' },
        { name: 'Regulations', path: '/dashboard/superadmin/regulations' }
      ],
      head_consultant: [
        { name: 'Dashboard', path: '/dashboard/head-consultant' },
        { name: 'Projects', path: '/dashboard/head-consultant/projects' },
        { name: 'Approvals', path: '/dashboard/head-consultant/approvals' }
      ],
      project_lead: [
        { name: 'Dashboard', path: '/dashboard/project-lead' },
        { name: 'My Projects', path: '/dashboard/projects' },
        { name: 'Inspections', path: '/dashboard/project-lead/inspections' }
      ],
      admin_lead: [
        { name: 'Dashboard', path: '/dashboard/admin-lead' },
        { name: 'Projects', path: '/dashboard/projects' },
        { name: 'Payments', path: '/dashboard/admin-lead/payments' },
        { name: 'Documents', path: '/dashboard/admin-lead/documents' }
      ],
      inspector: [
        { name: 'Dashboard', path: '/dashboard/inspector' },
        { name: 'My Inspections', path: '/dashboard/inspector/inspections' },
        { name: 'Checklists', path: '/dashboard/inspector/checklists' }
      ],
      drafter: [
        { name: 'Dashboard', path: '/dashboard/drafter' },
        { name: 'Reports', path: '/dashboard/drafter/reports' }
      ],
      client: [
        { name: 'Dashboard', path: '/dashboard/client' },
        { name: 'My Projects', path: '/dashboard/client/projects' },
        { name: 'Documents', path: '/dashboard/client/documents' }
      ]
    };
    
    return items[role] || [];
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
          onClick={() => router.push(item.path)}
        >
          <Text>{item.name}</Text>
        </MotionBox>
      ))}
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
                <MenuDivider /> {/* Sekarang sudah diimpor dengan benar */}
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