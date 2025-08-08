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
  Button
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { authService } from '../../services/api';

const DashboardLayout = ({ children, user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user || null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getMe();
        setCurrentUser(res.data || res); // mock/real API support
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    if (!user) fetchUser();
  }, [user, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getSidebarItems = () => {
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
        { name: 'My Projects', path: '/dashboard/project-lead/projects' },
        { name: 'Inspections', path: '/dashboard/project-lead/inspections' }
      ],
      admin_lead: [
        { name: 'Dashboard', path: '/dashboard/admin-lead' },
        { name: 'Projects', path: '/dashboard/admin-lead/projects' },
        { name: 'Payments', path: '/dashboard/admin-lead/payments' }
      ],
      inspector: [ // perbaikan: gunakan "inspector" bukan "inspektor"
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

    return items[currentUser?.role] || [];
  };

  return (
    <Flex h="100vh" direction="column">
      {/* Mobile Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>SLF One Manager</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap={4}>
              {getSidebarItems().map((item) => (
                <Box
                  key={item.path}
                  as="button"
                  p={3}
                  borderRadius="md"
                  bg={router.pathname === item.path ? 'blue.500' : 'transparent'}
                  color={router.pathname === item.path ? 'white' : 'inherit'}
                  onClick={() => {
                    router.push(item.path);
                    onClose();
                  }}
                  textAlign="left"
                  width="100%"
                >
                  {item.name}
                </Box>
              ))}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        w={{ base: 0, md: '250px' }}
        bg="gray.800"
        color="white"
        display={{ base: 'none', md: 'block' }}
        p={4}
      >
        <Text fontSize="xl" fontWeight="bold" mb={6} color="blue.300">
          SLF One Manager
        </Text>
        <Flex direction="column" gap={2}>
          {getSidebarItems().map((item) => (
            <Box
              key={item.path}
              as="button"
              p={3}
              borderRadius="md"
              bg={router.pathname === item.path ? 'blue.600' : 'transparent'}
              _hover={{ bg: 'gray.700' }}
              onClick={() => router.push(item.path)}
              textAlign="left"
              width="100%"
            >
              {item.name}
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Main Content */}
      <Flex flex={1} direction="column" overflow="hidden">
        {/* Top Navigation */}
        <Flex
          as="nav"
          align="center"
          justify="space-between"
          px={6}
          py={4}
          bg="white"
          borderBottom="1px"
          borderColor="gray.200"
          boxShadow="sm"
        >
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            icon={<HamburgerIcon />}
            aria-label="Open menu"
            variant="outline"
            colorScheme="blue"
          />
          
          <Text fontSize="xl" fontWeight="bold" color="blue.600">
            SLF One Manager
          </Text>
          
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" mr={2} name={currentUser?.name} src={currentUser?.avatar} />
              <Text display={{ base: 'none', md: 'inline' }}>{currentUser?.name}</Text>
            </MenuButton>
            <MenuList>
              <MenuItem as="a" href="/profile">Profile</MenuItem>
              <MenuItem as="a" href="/settings">Settings</MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        {/* Page Content */}
        <Box flex={1} overflow="auto" p={6} bg="gray.50">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;
