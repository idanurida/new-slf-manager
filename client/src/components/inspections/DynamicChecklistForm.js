// client/src/components/inspections/DynamicChecklistForm.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  useToast,
  Divider,
  FormErrorMessage,
  Skeleton
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';

const DynamicChecklistForm = ({ checklistItem, onSave, defaultSampleNumber = '' }) => {
  const [sampleNumber, setSampleNumber] = useState(defaultSampleNumber);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  // Handle response change
  const handleResponseChange = (columnName, value) => {
    setResponses(prev => ({ ...prev, [columnName]: value }));
    
    // Clear error when user starts typing
    if (errors[columnName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[columnName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate required fields
      const newErrors = {};
      if (!sampleNumber.trim()) {
        newErrors.sampleNumber = 'Sample number is required';
      }

      // Validate responses based on column_config
      if (checklistItem.column_config) {
        checklistItem.column_config.forEach(column => {
          const value = responses[column.name];
          if (!value && column.required) {
            newErrors[column.name] = `${column.label || column.name} is required`;
          }
        });
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
        setLoading(false);
        return;
      }

      // Prepare data for saving
      const responseData = {
        checklist_item_id: checklistItem.id,
        sample_number: sampleNumber,
        response_ responses
      };

      await onSave(responseData);

      toast({
        title: 'Success',
        description: `Checklist item "${checklistItem.description}" saved successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      // Reset form
      setSampleNumber(defaultSampleNumber);
      setResponses({});

    } catch (error) {
      console.error('Save checklist error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save checklist item',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  // Render dynamic columns based on column_config
  const renderColumns = () => {
    if (!checklistItem.column_config || checklistItem.column_config.length === 0) {
      return (
        <Text color="orange.500" fontSize="sm">
          ⚠️ No column configuration found for this checklist item
        </Text>
      );
    }

    return checklistItem.column_config.map((column) => {
      const { name, type, options = [], label, text_label, unit = '' } = column;
      const value = responses[name] ?? '';

      switch (type) {
        case 'radio':
          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormControl isInvalid={!!errors[name]}>
                <FormLabel fontSize="sm" fontWeight="medium">{label || name}</FormLabel>
                <RadioGroup 
                  onChange={(val) => handleResponseChange(name, val)} 
                  value={value}
                >
                  <Stack direction="row" flexWrap="wrap" spacing={4}>
                    {options.map((option) => (
                      <Radio key={option} value={option} size="sm">
                        {option}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
                <FormErrorMessage>{errors[name]}</FormErrorMessage>
              </FormControl>
            </motion.div>
          );

        case 'radio_with_text':
          // Handle radio with text input (special case for "Tidak Sesuai")
          const [radioVal, textVal = ''] = Array.isArray(value) ? value : [value, ''];
          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormControl isInvalid={!!errors[name]}>
                <FormLabel fontSize="sm" fontWeight="medium">{label || name}</FormLabel>
                <RadioGroup 
                  onChange={(val) => handleResponseChange(name, [val, textVal])} 
                  value={radioVal}
                >
                  <Stack direction="row" flexWrap="wrap" spacing={4}>
                    {options.map((option) => (
                      <Radio key={option} value={option} size="sm">
                        {option}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
                <FormErrorMessage>{errors[name]}</FormErrorMessage>
              </FormControl>
              
              {radioVal === 'Tidak Sesuai' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <FormControl mt={3} isInvalid={!!errors[`${name}_text`]}>
                    <FormLabel fontSize="sm">{text_label || 'Keterangan'}</FormLabel>
                    <Textarea
                      size="sm"
                      value={textVal}
                      onChange={(e) => handleResponseChange(name, [radioVal, e.target.value])}
                      placeholder={text_label || 'Masukkan keterangan...'}
                      minHeight="100px"
                    />
                    <FormErrorMessage>{errors[`${name}_text`]}</FormErrorMessage>
                  </FormControl>
                </motion.div>
              )}
            </motion.div>
          );

        case 'input_number':
          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormControl isInvalid={!!errors[name]}>
                <FormLabel fontSize="sm" fontWeight="medium">
                  {label || name} {unit ? `(${unit})` : ''}
                </FormLabel>
                <Input
                  size="sm"
                  type="number"
                  value={value}
                  onChange={(e) => handleResponseChange(name, e.target.value)}
                  placeholder={`Masukkan nilai ${unit ? `(${unit})` : ''}`}
                />
                <FormErrorMessage>{errors[name]}</FormErrorMessage>
              </FormControl>
            </motion.div>
          );

        case 'textarea':
          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormControl isInvalid={!!errors[name]}>
                <FormLabel fontSize="sm" fontWeight="medium">{label || name}</FormLabel>
                <Textarea
                  size="sm"
                  value={value}
                  onChange={(e) => handleResponseChange(name, e.target.value)}
                  placeholder={label || `Masukkan ${name}...`}
                  minHeight="100px"
                />
                <FormErrorMessage>{errors[name]}</FormErrorMessage>
              </FormControl>
            </motion.div>
          );

        default:
          // Fallback for unknown column types
          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormControl isInvalid={!!errors[name]}>
                <FormLabel fontSize="sm" fontWeight="medium">
                  {label || name} (Tipe: {type})
                </FormLabel>
                <Input
                  size="sm"
                  value={value}
                  onChange={(e) => handleResponseChange(name, e.target.value)}
                  placeholder={`Input untuk ${type}...`}
                />
                <FormErrorMessage>{errors[name]}</FormErrorMessage>
              </FormControl>
            </motion.div>
          );
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        as={motion.div}
        whileHover={{ boxShadow: 'lg' }}
        transition={{ duration: 0.2 }}
        variant="outline"
        borderRadius="lg"
      >
        <CardBody>
          <VStack spacing={4} align="stretch">
            {/* Header Item */}
            <Box>
              <Heading size="sm" color="blue.600">
                {checklistItem.code}
              </Heading>
              <Text fontSize="md" fontWeight="semibold" mt={1}>
                {checklistItem.description}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Kategori: {checklistItem.category}
              </Text>
            </Box>

            <Divider />

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <VStack spacing={5} align="stretch">
                {/* Input Sample Number */}
                <FormControl isRequired isInvalid={!!errors.sampleNumber}>
                  <FormLabel fontSize="sm" fontWeight="medium">Nomor Sampel</FormLabel>
                  <Input
                    size="sm"
                    value={sampleNumber}
                    onChange={(e) => setSampleNumber(e.target.value)}
                    placeholder="e.g., ITEM-001, LANTAI1-RUANG01"
                    isDisabled={loading}
                  />
                  <FormErrorMessage>{errors.sampleNumber}</FormErrorMessage>
                </FormControl>

                {/* Render kolom-kolom dinamis */}
                {renderColumns()}

                {/* Tombol Submit */}
                <HStack justifyContent="flex-end" pt={2}>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="sm"
                    isLoading={loading}
                    loadingText="Menyimpan..."
                    isDisabled={!sampleNumber.trim()} // Disable jika sample number kosong
                  >
                    Simpan Respons
                  </Button>
                </HStack>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default DynamicChecklistForm;
