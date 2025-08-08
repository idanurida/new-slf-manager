// src/components/dashboard/TodoList.js
import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  List,
  ListItem,
  Spinner,
  Checkbox,
  useToast
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoService } from 'services/api';
import { motion, AnimatePresence } from 'framer-motion';

const MotionListItem = motion(ListItem);

const TodoList = ({ userRole }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [newTodo, setNewTodo] = useState('');

  // ✅ React Query v5 format
  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos', userRole],
    queryFn: () => todoService.getTodosByRole(userRole).then(res => res.data),
    enabled: !!userRole
  });

  const addTodoMutation = useMutation({
    mutationFn: (todoText) =>
      todoService.addTodo(userRole, { text: todoText, completed: false }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', userRole] });
      toast({ title: 'Todo added', status: 'success' });
      setNewTodo('');
    },
    onError: () => {
      toast({ title: 'Failed to add todo', status: 'error' });
    }
  });

  const updateTodoStatusMutation = useMutation({
    mutationFn: ({ id, completed }) =>
      todoService.updateTodoStatus(id, completed).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', userRole] });
    }
  });

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodoMutation.mutate(newTodo);
    }
  };

  if (isLoading) {
    return (
      <Flex align="center" justify="center" h="100px">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex mb={4}>
        <Input
          placeholder="Add a new todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          mr={2}
        />
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAddTodo}
          isLoading={addTodoMutation.isLoading}
        >
          Add
        </Button>
      </Flex>

      <List spacing={3}>
        <AnimatePresence>
          {todos && todos.length > 0 ? (
            todos.map((todo) => (
              <MotionListItem
                key={todo.id}
                p={2}
                borderWidth="1px"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Checkbox
                  isChecked={todo.completed}
                  onChange={(e) =>
                    updateTodoStatusMutation.mutate({
                      id: todo.id,
                      completed: e.target.checked
                    })
                  }
                >
                  {todo.text}
                </Checkbox>
              </MotionListItem>
            ))
          ) : (
            <Box>No todos found</Box>
          )}
        </AnimatePresence>
      </List>
    </Box>
  );
};

export default TodoList;
