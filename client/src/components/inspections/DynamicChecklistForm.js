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
// Hapus axios karena tidak digunakan langsung
// import axios from 'axios';

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
          
          // Validasi tambahan untuk radio_with_text jika "Tidak Sesuai" dipilih
          if (column.type === 'radio_with_text' && Array.isArray(value)) {
            const [radioVal, textVal] = value;
            if (radioVal === 'Tidak Sesuai' && !textVal?.trim()) {
              newErrors[`${column.name}_text`] = `${column.text_label || 'Keterangan'} is required when "Tidak Sesuai" is selected`;
            }
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
        responses: responses // Perbaiki typo: 'response_' -> 'responses'
      };

      // Simulasi pemanggilan onSave dengan try-catch untuk mock/testing
      try {
        // Jika onSave adalah fungsi mock, ini akan berhasil
        // Jika onSave mencoba menghubungi API nyata, ini akan gagal dan ditangkap oleh catch luar
        await onSave(responseData);
        
        toast({
          title: 'Success',
          description: `Checklist item "${checklistItem.description}" saved successfully (Mock Mode)`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });

        // Reset form
        setSampleNumber(defaultSampleNumber);
        setResponses({});
      } catch (saveError) {
        // Tangani error dari onSave (misalnya, jika itu mencoba memanggil API nyata)
        console.error('Error in onSave callback:', saveError);
        toast({
          title: 'Save Simulation',
          description: `Checklist item "${checklistItem.description}" processed in mock mode. In a real app, this would save to a database.`,
          status: 'info', // Ubah status ke 'info' untuk menunjukkan simulasi
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        
        // Meskipun error, kita masih reset form untuk simulasi
        setSampleNumber(defaultSampleNumber);
        setResponses({});
      }

    } catch (error) {
      // Tangani error validasi atau error lainnya dalam komponen ini
      console.error('Save checklist error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process checklist item (Mock Mode)',
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
          ⚠️ No column configuration found for this checklist item (Mock)
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
                <FormLabel fontSize="sm" fontWeight="medium">{label || name} (Mock)</FormLabel>
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
          // Pastikan value selalu array [radioValue, textValue]
          const [radioVal, textVal = ''] = Array.isArray(value) ? value : [value, ''];
          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormControl isInvalid={!!errors[name]}>
                <FormLabel fontSize="sm" fontWeight="medium">{label || name} (Mock)</FormLabel>
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
                    <FormLabel fontSize="sm">{text_label || 'Keterangan'} (Mock)</FormLabel>
                    <Textarea
                      size="sm"
                      value={textVal}
                      onChange={(e) => handleResponseChange(name, [radioVal, e.target.value])}
                      placeholder={text_label || 'Masukkan keterangan... (Mock)'}
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
                  {label || name} {unit ? `(${unit})` : ''} (Mock)
                </FormLabel>
                <Input
                  size="sm"
                  type="number"
                  value={value}
                  onChange={(e) => handleResponseChange(name, e.target.value)}
                  placeholder={`Masukkan nilai ${unit ? `(${unit})` : ''} (Mock)`}
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
                <FormLabel fontSize="sm" fontWeight="medium">{label || name} (Mock)</FormLabel>
                <Textarea
                  size="sm"
                  value={value}
                  onChange={(e) => handleResponseChange(name, e.target.value)}
                  placeholder={label || `Masukkan ${name}... (Mock)`}
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
                  {label || name} (Tipe: {type}) (Mock)
                </FormLabel>
                <Input
                  size="sm"
                  value={value}
                  onChange={(e) => handleResponseChange(name, e.target.value)}
                  placeholder={`Input untuk ${type}... (Mock)`}
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
                {checklistItem.code} (Mock)
              </Heading>
              <Text fontSize="md" fontWeight="semibold" mt={1}>
                {checklistItem.description} (Mock)
              </Text>
              <Text fontSize="xs" color="gray.500">
                Kategori: {checklistItem.category} (Mock)
              </Text>
            </Box>

            <Divider />

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <VStack spacing={5} align="stretch">
                {/* Input Sample Number */}
                <FormControl isRequired isInvalid={!!errors.sampleNumber}>
                  <FormLabel fontSize="sm" fontWeight="medium">Nomor Sampel (Mock)</FormLabel>
                  <Input
                    size="sm"
                    value={sampleNumber}
                    onChange={(e) => setSampleNumber(e.target.value)}
                    placeholder="e.g., ITEM-001, LANTAI1-RUANG01 (Mock)"
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
                    loadingText="Menyimpan... (Mock)"
                    isDisabled={!sampleNumber.trim()} // Disable jika sample number kosong
                  >
                    Simpan Respons (Mock)
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