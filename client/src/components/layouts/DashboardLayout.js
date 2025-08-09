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
  HStack
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiFolder, FiUsers, FiFileText, FiCheckCircle, FiUser, FiFile, FiBarChart2 } from 'react-icons/fi';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Mock user data for frontend testing
const mockUsers = {
  superadmin: {
    id: 1,
    name: 'Super Admin Mock',
    email: 'superadmin@mock.com',
    role: 'superadmin',
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
  },
  head_consultant: {
    id: 7,
    name: 'Head Consultant Mock',
    email: 'head.consultant@mock.com',
    role: 'head_consultant',
    avatar: null
  }
};

const DashboardLayout = ({ children, user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user || null);

  // For frontend testing, we'll use mock user data
  useEffect(() => {
    // Only fetch user if not provided as prop and we're in browser
    if (!user && typeof window !== 'undefined') {
      // Try to get mock user role from localStorage or default to project_lead
      const mockRole = localStorage.getItem('mockUserRole') || 'project_lead';
      const mockUser = mockUsers[mockRole] || mockUsers.project_lead;
      setCurrentUser(mockUser);
    } else if (user) {
      // Use provided user prop
      setCurrentUser(user);
    } else if (typeof window === 'undefined') {
      // For SSR, use a default mock user
      setCurrentUser(mockUsers.project_lead);
    }
  }, [user]);

  const handleLogout = () => {
    // For frontend testing, just redirect to login
    router.push('/login');
  };

  const getSidebarItems = () => {
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
        { name: 'Payments', path: '/dashboard/admin-lead/payments', icon: <FiFileText /> },
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
    return items[currentUser?.role] || [];
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
          {item.icon}
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