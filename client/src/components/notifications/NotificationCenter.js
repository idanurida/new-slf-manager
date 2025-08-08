// client/src/components/notifications/NotificationCenter.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Skeleton,
  Badge,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  BellIcon, 
  CheckIcon, 
  CloseIcon, 
  ViewIcon, 
  DeleteIcon,
  ChevronDownIcon
} from '@chakra-ui/icons';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const toast = useToast();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const response = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setNotifications(response.data.notifications || response.data);
        setUnreadCount(response.data.unread_count || 0);
      } catch (error) {
        console.error('Fetch notifications error:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Gagal memuat notifikasi',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, toast]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
      
      toast({
        title: 'Berhasil',
        description: 'Notifikasi ditandai sebagai telah dibaca',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal menandai notifikasi',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setMarkingAsRead(true);
    try {
      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setUnreadCount(0);
      
      toast({
        title: 'Berhasil',
        description: 'Semua notifikasi ditandai sebagai telah dibaca',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal menandai semua notifikasi',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) {
      return;
    }

    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      toast({
        title: 'Berhasil',
        description: 'Notifikasi dihapus',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Gagal menghapus notifikasi',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  // Format date
  const formatDate = (date) => {
    return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: localeId });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Skeleton height="30px" width="200px" />
              <Skeleton height="20px" width="300px" />
              
              <VStack spacing={3} align="stretch">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} height="60px" />
                ))}
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <Box>
                <Heading size="md" color="blue.600">
                  Pusat Notifikasi
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {unreadCount} notifikasi belum dibaca
                </Text>
              </Box>
              
              <HStack spacing={2}>
                <Button
                  size="sm"
                  onClick={markAllAsRead}
                  isLoading={markingAsRead}
                  loadingText="Menandai..."
                  isDisabled={unreadCount === 0}
                >
                  Tandai Semua Dibaca
                </Button>
                
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    rightIcon={<ChevronDownIcon />}
                  >
                    Filter
                  </MenuButton>
                  <MenuList>
                    <MenuItem>Semua Notifikasi</MenuItem>
                    <MenuItem>Belum Dibaca</MenuItem>
                    <MenuItem>Sudah Dibaca</MenuItem>
                    <MenuDivider />
                    <MenuItem>Berdasarkan Prioritas</MenuItem>
                    <MenuItem>Berdasarkan Tanggal</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </HStack>

            <Divider />

            {notifications && notifications.length > 0 ? (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th width="50px">Status</Th>
                      <Th>Judul</Th>
                      <Th>Pesan</Th>
                      <Th width="150px">Tanggal</Th>
                      <Th width="120px">Prioritas</Th>
                      <Th width="100px">Aksi</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {notifications.map((notification) => (
                      <Tr 
                        key={notification.id}
                        bg={notification.is_read ? 'white' : 'blue.50'}
                        borderLeft={notification.is_read ? 'none' : '4px solid'}
                        borderLeftColor={notification.is_read ? 'none' : 'blue.500'}
                      >
                        <Td>
                          <Badge 
                            colorScheme={notification.is_read ? 'green' : 'yellow'}
                            fontSize="xs"
                          >
                            {notification.is_read ? 'Dibaca' : 'Baru'}
                          </Badge>
                        </Td>
                        
                        <Td>
                          <Text fontWeight="bold" fontSize="sm">
                            {notification.title}
                          </Text>
                          {notification.related_project_id && (
                            <Text fontSize="xs" color="gray.500">
                              Proyek: {notification.related_project?.name || `ID: ${notification.related_project_id}`}
                            </Text>
                          )}
                        </Td>
                        
                        <Td>
                          <Text fontSize="sm">
                            {notification.message}
                          </Text>
                        </Td>
                        
                        <Td>
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(notification.created_at)}
                          </Text>
                        </Td>
                        
                        <Td>
                          <Badge 
                            colorScheme={getPriorityColor(notification.priority)}
                            fontSize="xs"
                          >
                            {notification.priority}
                          </Badge>
                        </Td>
                        
                        <Td>
                          <HStack spacing={1}>
                            {!notification.is_read && (
                              <Tooltip label="Tandai sebagai dibaca">
                                <IconButton
                                  size="xs"
                                  icon={<CheckIcon />}
                                  colorScheme="green"
                                  onClick={() => markAsRead(notification.id)}
                                  aria-label="Mark as read"
                                />
                              </Tooltip>
                            )}
                            
                            {notification.action_required && notification.action_url && (
                              <Tooltip label="Lihat Detail">
                                <IconButton
                                  size="xs"
                                  icon={<ViewIcon />}
                                  colorScheme="blue"
                                  onClick={() => window.location.href = notification.action_url}
                                  aria-label="View details"
                                />
                              </Tooltip>
                            )}
                            
                            <Tooltip label="Hapus">
                              <IconButton
                                size="xs"
                                icon={<DeleteIcon />}
                                colorScheme="red"
                                onClick={() => deleteNotification(notification.id)}
                                aria-label="Delete notification"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Alert status="info">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle>Tidak Ada Notifikasi</AlertTitle>
                  <AlertDescription>
                    Anda tidak memiliki notifikasi saat ini.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default NotificationCenter;
