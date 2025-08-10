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
  HStack,
  VStack,
  Divider,
  useColorModeValue,
  Icon,
  Tooltip,
  Collapse,
  useToast
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon, ChevronRightIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { FiHome, FiUsers, FiFile, FiSettings, FiLogOut, FiUser, FiCheckSquare, FiDollarSign, FiLayers } from 'react-icons/fi'; // Tambahkan react-icons

// --- Definisikan komponen motion dengan benar ---
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
// -----------------------------

// Mock data statis untuk testing frontend dengan konsistensi email @mock.com
const mockUsers = {
  superadmin: {
    id: 1,
    name: 'Super Admin Mock User',
    role: 'superadmin',
    email: 'superadmin@mock.com',
    avatar: 'https://bit.ly/broken-link' // Placeholder
  },
  head_consultant: {
    id: 2,
    name: 'Head Consultant Mock User',
    role: 'head_consultant',
    email: 'head.consultant@mock.com',
    avatar: 'https://bit.ly/broken-link'
  },
  project_lead: {
    id: 3,
    name: 'Project Lead Mock User',
    role: 'project_lead',
    email: 'project.lead@mock.com',
    avatar: 'https://bit.ly/broken-link'
  },
  admin_lead: {
    id: 4,
    name: 'Admin Lead Mock User',
    role: 'admin_lead',
    email: 'admin.lead@mock.com',
    avatar: 'https://bit.ly/broken-link'
  },
  inspector: {
    id: 5,
    name: 'Inspector Mock User',
    role: 'inspector',
    email: 'inspector@mock.com',
    avatar: 'https://bit.ly/broken-link'
  },
  drafter: {
    id: 6,
    name: 'Drafter Mock User',
    role: 'drafter',
    email: 'drafter@mock.com',
    avatar: 'https://bit.ly/broken-link'
  },
  client: {
    id: 7,
    name: 'Client Mock User',
    role: 'client',
    email: 'client@mock.com',
    avatar: 'https://bit.ly/broken-link'
  }
};

// --- Peta ikon untuk sidebar ---
const getIconForItem = (itemName) => {
  switch (itemName.toLowerCase()) {
    case 'dashboard': return FiHome;
    case 'users': return FiUsers;
    case 'projects':
    case 'my projects': return FiLayers;
    case 'approvals': return FiCheckSquare;
    case 'payments': return FiDollarSign;
    case 'documents':
    case 'reports': return FiFile;
    case 'checklists': return FiCheckSquare;
    default: return FiFile; // Default icon
  }
};
// -----------------------------

const DashboardLayout = ({ children, user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user || null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // State untuk collapse sidebar
  const toast = useToast();

  // --- Variabel warna Chakra untuk tema dinamis ---
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const sidebarBg = useColorModeValue('gray.800', 'gray.700');
  const sidebarColor = useColorModeValue('white', 'gray.100');
  const activeItemBg = useColorModeValue('blue.600', 'blue.500');
  const hoverItemBg = useColorModeValue('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const topNavBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(45, 55, 72, 0.9)');
  // -----------------------------------------------

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      return;
    }

    if (typeof window === 'undefined') {
      setCurrentUser(mockUsers.project_lead);
      return;
    }

    try {
      const storedRole = localStorage.getItem('mockUserRole');
      if (storedRole && mockUsers[storedRole]) {
        setCurrentUser(mockUsers[storedRole]);
        return;
      }
      setCurrentUser(mockUsers.project_lead);
    } catch (error) {
      console.error('[DashboardLayout] Error determining mock user role:', error);
      setCurrentUser(mockUsers.project_lead);
    }
  }, [user]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('mockUserRole');
    }
    router.push('/login');
    
    // Tambahkan toast notifikasi untuk logout
    toast({
      title: "Logged out.",
      description: "You have been successfully logged out.",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top-right"
    });
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

  // --- Komponen Sidebar Item dengan animasi dan ikon ---
  const SidebarItem = ({ item, isMobile = false }) => {
    const isActive = router.pathname === item.path;
    const IconComponent = getIconForItem(item.name);

    return (
      <MotionBox
        as="button"
        display="flex"
        alignItems="center"
        w="100%"
        px={sidebarCollapsed && !isMobile ? 2 : 4}
        py={3}
        borderRadius="lg"
        fontWeight="medium"
        textAlign="left"
        bg={isActive ? activeItemBg : 'transparent'}
        color={isActive ? 'white' : sidebarColor}
        _hover={{ 
          bg: isActive ? activeItemBg : hoverItemBg,
          transform: 'translateX(2px)' // Efek hover kecil
        }}
        whileHover={{ scale: 1.02 }} // Efek hover dengan Framer Motion
        whileTap={{ scale: 0.98 }} // Efek tap dengan Framer Motion
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          router.push(item.path);
          if (isMobile) onClose(); // Tutup drawer mobile setelah klik
        }}
      >
        <Icon as={IconComponent} mr={sidebarCollapsed && !isMobile ? 0 : 3} boxSize={5} />
        <Collapse in={!sidebarCollapsed || isMobile} animateOpacity>
          <Text>{item.name}</Text>
        </Collapse>
      </MotionBox>
    );
  };
  // -------------------------------------------------------

  // --- Komponen Sidebar Content ---
  const SidebarContent = ({ isMobile = false }) => (
    <VStack align="stretch" spacing={1} mt={2}>
      {getSidebarItems().map((item) => (
        <SidebarItem key={item.path} item={item} isMobile={isMobile} />
      ))}
    </VStack>
  );
  // --------------------------------

  return (
    <Flex h="100vh" direction="column" bg={bgColor}>
      {/* Mobile Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg} color={sidebarColor}>
          <DrawerCloseButton />
          <DrawerHeader fontSize="lg" fontWeight="bold" color="blue.300">
            SLF One Manager
          </DrawerHeader>
          <DrawerBody>
            <SidebarContent isMobile={true} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Flex flex={1}>
        {/* Desktop Sidebar dengan animasi collapse */}
        <MotionBox
          as="aside"
          w={{ base: 0, md: sidebarCollapsed ? '70px' : '250px' }} // Lebar berubah saat collapse
          bg={sidebarBg}
          color={sidebarColor}
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
          p={4}
          boxShadow="lg"
          initial={{ width: 0 }}
          animate={{ width: sidebarCollapsed ? 70 : 250 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Flex justify={sidebarCollapsed ? "center" : "space-between"} align="center" mb={6}>
            <Collapse in={!sidebarCollapsed} animateOpacity>
              <Text fontSize="xl" fontWeight="bold" color="blue.300" isTruncated>
                SLF One Manager
              </Text>
            </Collapse>
            {/* Tombol untuk collapse/expand sidebar */}
            <Tooltip label={sidebarCollapsed ? "Expand menu" : "Collapse menu"} placement="right">
              <IconButton
                aria-label={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
                icon={<ChevronRightIcon />}
                size="sm"
                variant="ghost"
                color="white"
                transform={sidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)"}
                transition="transform 0.3s"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                _hover={{ bg: 'rgba(255,255,255,0.1)' }}
              />
            </Tooltip>
          </Flex>
          <SidebarContent />
        </MotionBox>

        {/* Main Content */}
        <Flex flex={1} direction="column" overflow="hidden">
          {/* Top Navigation with Glassmorphism dan animasi */}
          <MotionFlex
            as="nav"
            align="center"
            justify="space-between"
            px={4}
            py={3}
            position="sticky"
            top={0}
            zIndex={10}
            bg={topNavBg}
            backdropFilter="blur(12px)"
            borderBottom={`1px solid ${borderColor}`}
            boxShadow="sm"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 15,
              opacity: { duration: 0.5 }
            }}
          >
            <HStack spacing={4}>
              <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                icon={<HamburgerIcon />}
                aria-label="Open menu"
                variant="outline"
                colorScheme="blue"
              />
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Text fontSize="lg" fontWeight="bold" color="blue.600" isTruncated maxWidth="200px">
                  SLF One Manager
                </Text>
              </MotionBox>
            </HStack>
            
            <Menu>
              <MenuButton 
                as={Button} 
                rightIcon={<ChevronDownIcon />} 
                variant="outline"
                _hover={{ bg: 'blue.50' }}
              >
                <HStack spacing={2}>
                  <Avatar size="sm" name={currentUser?.name} src={currentUser?.avatar} />
                  <VStack 
                    display={{ base: 'none', md: 'flex' }} 
                    alignItems="flex-start" 
                    spacing="1px" 
                    ml="2"
                  >
                    <Text fontSize="sm" fontWeight="bold">
                      {currentUser?.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {currentUser?.role?.replace(/_/g, ' ')}
                    </Text>
                  </VStack>
                </HStack>
              </MenuButton>
              <MenuList 
                borderColor={borderColor} 
                boxShadow="lg"
                py={2}
              >
                <MenuItem as="a" href="/profile" icon={<FiUser />}>
                  <HStack>
                    <Text>Profile</Text>
                    <ExternalLinkIcon boxSize={3} />
                  </HStack>
                </MenuItem>
                <MenuItem as="a" href="/settings" icon={<FiSettings />}>
                  <HStack>
                    <Text>Settings</Text>
                    <ExternalLinkIcon boxSize={3} />
                  </HStack>
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout} icon={<FiLogOut />} color="red.500">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </MotionFlex>

          {/* Page Content with Transition dan animasi stagger */}
          <Box flex={1} overflow="auto" p={{ base: 4, md: 6 }}>
            <AnimatePresence mode="wait">
              <MotionBox
                key={router.pathname}
                initial="pageInitial"
                animate="pageAnimate"
                exit="pageExit"
                variants={{
                  pageInitial: { 
                    opacity: 0, 
                    y: 20,
                    scale: 0.98
                  },
                  pageAnimate: { 
                    opacity: 1, 
                    y: 0,
                    scale: 1,
                    transition: { 
                      type: "spring", 
                      stiffness: 100, 
                      damping: 20,
                      staggerChildren: 0.1 // Untuk animasi anak-anak (jika ada)
                    } 
                  },
                  pageExit: { 
                    opacity: 0, 
                    y: -20,
                    scale: 0.98,
                    transition: { duration: 0.2 } 
                  }
                }}
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