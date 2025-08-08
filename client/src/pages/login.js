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
  HStack
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { authService } from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Redirect to dashboard
      router.push('/dashboard');

      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Invalid credentials';
      toast({
        title: 'Login failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
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
              Login to your account
            </Text>
          </VStack>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                loadingText="Logging in"
                w="100%"
                size="lg"
              >
                Login
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
