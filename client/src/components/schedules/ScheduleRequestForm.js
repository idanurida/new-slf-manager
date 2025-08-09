import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { scheduleService } from 'services/api';

const ScheduleRequestForm = ({ isOpen, onClose, projectId, onScheduleCreated }) => {
  const { register, handleSubmit, reset } = useForm();
  const toast = useToast();

  const onSubmit = async (data) => {
    try {
      await scheduleService.createScheduleRequest({ ...data, projectId });
      toast({
        title: 'Schedule Request Sent',
        description: 'The schedule request has been sent to the client for approval.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      reset();
      onScheduleCreated(); // Callback to refresh the list
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create schedule request.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Request New Schedule</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input {...register('title')} placeholder='e.g., Kick-off Meeting' />
          </FormControl>

          <FormControl mt={4} isRequired>
            <FormLabel>Date and Time</FormLabel>
            <Input {...register('scheduled_date')} type="datetime-local" />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Notes</FormLabel>
            <Textarea {...register('notes')} placeholder='e.g., Discuss project timeline and deliverables.' />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} type="submit">
            Send Request
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScheduleRequestForm;
