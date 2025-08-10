// src/components/dashboard/TodoList.js
import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Spinner,
  Checkbox,
  useToast,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  IconButton,
  useColorModeValue,
  Badge,
  HStack,
  VStack,
  Divider,
  Tooltip,
  Progress
} from '@chakra-ui/react';
import { AddIcon, CheckIcon, EditIcon, DeleteIcon, WarningIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoService } from 'services/api';
import { motion, AnimatePresence } from 'framer-motion';

const MotionListItem = motion(ListItem);

const TodoList = ({ userRole }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Warna dinamis untuk tema terang/gelap
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const completedBg = useColorModeValue('green.50', 'green.900');
  const headerBg = useColorModeValue('blue.50', 'blue.900');

  // ✅ React Query v5 format
  const { data: todos, isLoading, isError, error } = useQuery({
    queryKey: ['todos', userRole],
    queryFn: () => todoService.getTodosByRole(userRole).then(res => res.data),
    enabled: !!userRole,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 menit
  });

  // Hitung statistik
  const totalTodos = todos?.length || 0;
  const completedTodos = todos?.filter(todo => todo.completed).length || 0;
  const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  const addTodoMutation = useMutation({
    mutationFn: (todoText) =>
      todoService.addTodo(userRole, { text: todoText, completed: false }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', userRole] });
      toast({ 
        title: 'Todo added successfully', 
        status: 'success',
        duration: 3000,
        isClosable: true 
      });
      setNewTodo('');
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to add todo', 
        description: error.message || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true 
      });
    }
  });

  const updateTodoStatusMutation = useMutation({
    mutationFn: ({ id, completed }) =>
      todoService.updateTodoStatus(id, completed).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', userRole] });
      toast({ 
        title: 'Todo updated', 
        status: 'info',
        duration: 2000,
        isClosable: true 
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update todo', 
        description: error.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true 
      });
    }
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id) => todoService.deleteTodo(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', userRole] });
      toast({ 
        title: 'Todo deleted', 
        status: 'warning',
        duration: 3000,
        isClosable: true 
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to delete todo', 
        description: error.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true 
      });
    }
  });

  const updateTodoTextMutation = useMutation({
    mutationFn: ({ id, text }) => todoService.updateTodoText(id, text).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', userRole] });
      setEditingId(null);
      setEditText('');
      toast({ 
        title: 'Todo updated', 
        status: 'success',
        duration: 3000,
        isClosable: true 
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update todo', 
        description: error.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true 
      });
    }
  });

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodoMutation.mutate(newTodo);
    } else {
      toast({
        title: 'Empty todo',
        description: "Please enter a todo item",
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleUpdateStatus = (id, completed) => {
    updateTodoStatusMutation.mutate({ id, completed });
  };

  const handleDelete = (id) => {
    deleteTodoMutation.mutate(id);
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleUpdateText = (id) => {
    if (editText.trim()) {
      updateTodoTextMutation.mutate({ id, text: editText });
    } else {
      toast({
        title: 'Empty todo',
        description: "Todo text cannot be empty",
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      if (editingId) {
        handleUpdateText(id);
      } else {
        handleAddTodo();
      }
    }
    if (e.key === 'Escape') {
      setEditingId(null);
      setEditText('');
    }
  };

  if (isLoading) {
    return (
      <Flex align="center" justify="center" h="200px" direction="column">
        <Spinner size="xl" color="blue.500" thickness="3px" />
        <Text mt={4} color="gray.500">Loading your todos...</Text>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Card bg={cardBg} boxShadow="md" borderRadius="lg">
        <CardBody>
          <Flex direction="column" align="center" py={10}>
            <WarningIcon boxSize="3rem" color="red.500" mb={4} />
            <Heading as="h3" size="md" mb={2} color="red.500">
              Error Loading Todos
            </Heading>
            <Text color="gray.500" textAlign="center" mb={4}>
              {error?.message || 'Failed to load todo items. Please try again later.'}
            </Text>
            <Button 
              colorScheme="red" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['todos', userRole] })}
            >
              Retry
            </Button>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={cardBg} boxShadow="md" borderRadius="lg" overflow="hidden">
      <CardHeader bg={headerBg} pb={4} pt={4}>
        <Flex justify="space-between" align="center" wrap="wrap">
          <Heading as="h2" size="md" color="blue.600">
            Task Manager
          </Heading>
          <Badge colorScheme="blue" fontSize="sm">
            {userRole?.replace(/_/g, ' ') || 'User'}
          </Badge>
        </Flex>
        
        <Box mt={4}>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Progress: {completedTodos}/{totalTodos} completed
          </Text>
          <Progress 
            value={progressPercentage} 
            size="sm" 
            colorScheme={progressPercentage === 100 ? "green" : "blue"} 
            borderRadius="full" 
            hasStripe={progressPercentage < 100}
          />
        </Box>
      </CardHeader>
      
      <CardBody>
        <Flex mb={6} flexDirection={{ base: 'column', sm: 'row' }} gap={2}>
          <InputGroup flex="1">
            <InputLeftElement pointerEvents='none'>
              <AddIcon color='gray.300' />
            </InputLeftElement>
            <Input
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e)}
              bg={useColorModeValue('white', 'gray.800')}
              borderColor={borderColor}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
            />
          </InputGroup>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddTodo}
            isLoading={addTodoMutation.isPending}
            loadingText="Adding"
            flexShrink={0}
            width={{ base: '100%', sm: 'auto' }}
          >
            Add Task
          </Button>
        </Flex>

        {totalTodos > 0 ? (
          <>
            <Text fontSize="sm" color="gray.500" mb={3}>
              {totalTodos} {totalTodos === 1 ? 'task' : 'tasks'} in list
            </Text>
            
            <List spacing={3}>
              <AnimatePresence>
                {todos.map((todo) => (
                  <MotionListItem
                    key={todo.id}
                    p={0}
                    bg={todo.completed ? completedBg : 'transparent'}
                    borderRadius="md"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <Card 
                      variant="outline" 
                      borderColor={borderColor}
                      _hover={{ bg: hoverBg }}
                    >
                      <CardBody>
                        <Flex align="center" justify="space-between">
                          {editingId === todo.id ? (
                            <Flex flex="1" mr={2}>
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, todo.id)}
                                autoFocus
                                mr={2}
                                size="sm"
                              />
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleUpdateText(todo.id)}
                                leftIcon={<CheckIcon />}
                                mr={2}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </Flex>
                          ) : (
                            <>
                              <Checkbox
                                isChecked={todo.completed}
                                onChange={(e) => handleUpdateStatus(todo.id, e.target.checked)}
                                size="lg"
                                colorScheme="green"
                                sx={{
                                  '.chakra-checkbox__control': {
                                    borderRadius: 'full'
                                  }
                                }}
                              >
                                <Text 
                                  as={todo.completed ? "s" : "span"} 
                                  color={todo.completed ? "gray.500" : "inherit"}
                                  fontWeight={todo.completed ? "normal" : "medium"}
                                >
                                  {todo.text}
                                </Text>
                              </Checkbox>
                              
                              <HStack spacing={1}>
                                <Tooltip label="Edit task" placement="top">
                                  <IconButton
                                    aria-label="Edit todo"
                                    icon={<EditIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => startEditing(todo)}
                                  />
                                </Tooltip>
                                <Tooltip label="Delete task" placement="top">
                                  <IconButton
                                    aria-label="Delete todo"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDelete(todo.id)}
                                    isLoading={deleteTodoMutation.isPending}
                                  />
                                </Tooltip>
                              </HStack>
                            </>
                          )}
                        </Flex>
                      </CardBody>
                    </Card>
                  </MotionListItem>
                ))}
              </AnimatePresence>
            </List>
          </>
        ) : (
          <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            py={10}
            textAlign="center"
            border="1px dashed"
            borderColor={borderColor}
            borderRadius="md"
          >
            <Box fontSize="4xl" mb={4}>📋</Box>
            <Heading as="h3" size="md" mb={2} color="gray.500">
              No Tasks Yet
            </Heading>
            <Text color="gray.500">
              Add your first task using the form above to get started!
            </Text>
          </Flex>
        )}
      </CardBody>
    </Card>
  );
};

export default TodoList;