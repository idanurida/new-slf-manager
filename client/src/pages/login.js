// client/src/pages/login.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  Link,
  HStack,
  Select
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

// Mock user credentials untuk frontend testing
const mockUsers = {
  'superadmin@mock.com': { token: 'mock-jwt-superadmin', role: 'superadmin' },
  'project.lead@mock.com': { token: 'mock-jwt-project_lead', role: 'project_lead' },
  'admin.lead@mock.com': { token: 'mock-jwt-admin_lead', role: 'admin_lead' },
  'inspector@mock.com': { token: 'mock-jwt-inspector', role: 'inspector' },
  'drafter@mock.com': { token: 'mock-jwt-drafter', role: 'drafter' },
  'client@mock.com': { token: 'mock-jwt-client', role: 'client' },
  'head.consultant@mock.com': { token: 'mock-jwt-head_consultant', role: 'head_consultant' }
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mockRole, setMockRole] = useState('project_lead'); // Default role
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Untuk frontend testing, kita bisa menggunakan password apapun
    // Tapi untuk konsistensi, kita bisa tetap memeriksa jika diinginkan
    
    try {
      // Cek apakah email ada dalam mock users
      if (mockUsers[email]) {
        const { token, role } = mockUsers[email];
        
        // Store token dan role di localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('mockUserRole', role);
        
        // Redirect to dashboard
        router.push('/dashboard');

        toast({
          title: 'Login successful',
          description: `Logged in as ${role}`,
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        // Untuk testing, kita bisa membuat user mock dinamis
        const token = `mock-jwt-${mockRole}`;
        localStorage.setItem('token', token);
        localStorage.setItem('mockUserRole', mockRole);
        
        router.push('/dashboard');
        
        toast({
          title: 'Login successful',
          description: `Logged in with mock role: ${mockRole}`,
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid credentials',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Email dan password mock untuk testing cepat
  const handleQuickLogin = (userEmail, userRole) => {
    setEmail(userEmail);
    setPassword('123'); // Password default untuk semua mock user
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      p={4}
    >
      <Box
        w="100%"
        maxW="400px"
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" color="blue.600">
              SLF One Manager
            </Heading>
            <Text color="gray.600">
              Mock Login for Frontend Testing
            </Text>
          </VStack>

          {/* Quick Login Buttons untuk testing cepat */}
          <VStack spacing={2} w="100%">
            <Text fontSize="sm" color="gray.500">Quick Login:</Text>
            <HStack spacing={2} wrap="wrap" justify="center">
              <Button 
                size="xs" 
                variant="outline" 
                onClick={() => handleQuickLogin('superadmin@mock.com', 'superadmin')}
              >
                Superadmin
              </Button>
              <Button 
                size="xs" 
                variant="outline" 
                onClick={() => handleQuickLogin('project.lead@mock.com', 'project_lead')}
              >
                Project Lead
              </Button>
              <Button 
                size="xs" 
                variant="outline" 
                onClick={() => handleQuickLogin('admin.lead@mock.com', 'admin_lead')}
              >
                Admin Lead
              </Button>
            </HStack>
          </VStack>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter mock email"
                  list="mock-emails"
                />
                <datalist id="mock-emails">
                  <option value="superadmin@mock.com" />
                  <option value="project.lead@mock.com" />
                  <option value="admin.lead@mock.com" />
                  <option value="inspector@mock.com" />
                  <option value="drafter@mock.com" />
                  <option value="client@mock.com" />
                  <option value="head.consultant@mock.com" />
                </datalist>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter any password (mock)"
                />
              </FormControl>

              {/* Pilihan role untuk user yang tidak terdaftar */}
              <FormControl>
                <FormLabel>Mock Role (if email not found)</FormLabel>
                <Select
                  value={mockRole}
                  onChange={(e) => setMockRole(e.target.value)}
                >
                  <option value="project_lead">Project Lead</option>
                  <option value="admin_lead">Admin Lead</option>
                  <option value="inspector">Inspector</option>
                  <option value="drafter">Drafter</option>
                  <option value="client">Client</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="head_consultant">Head Consultant</option>
                </Select>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                loadingText="Logging in"
                w="100%"
                size="lg"
              >
                Login (Mock)
              </Button>
            </VStack>
          </form>

          <HStack justify="center">
            <Text color="gray.600">
              Don't have an account?{' '}
              <Link color="blue.500" href="/register">
                Register
              </Link>
            </Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginPage;