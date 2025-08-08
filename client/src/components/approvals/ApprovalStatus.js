// client/src/components/approvals/ApprovalStatus.js
import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Divider,
  Skeleton
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const ApprovalStatus = ({ approvalStatus, loading = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('id-ID') : '-';
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <Skeleton height="30px" width="200px" mb={4} />
          <VStack spacing={3} align="stretch">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="50px" />
            ))}
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="blue.600">
              Status Persetujuan
            </Heading>

            <Divider />

            <VStack spacing={3} align="stretch">
              {/* Project Lead Approval */}
              <Box>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Project Lead</Text>
                  <Badge colorScheme={getStatusColor(approvalStatus?.project_lead?.status || 'pending')}>
                    {approvalStatus?.project_lead?.status || 'pending'}
                  </Badge>
                </HStack>
                {approvalStatus?.project_lead?.approved_at && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Disetujui pada: {formatDate(approvalStatus.project_lead.approved_at)}
                  </Text>
                )}
                {approvalStatus?.project_lead?.comment && (
                  <Text fontSize="sm" mt={1}>
                    Komentar: {approvalStatus.project_lead.comment}
                  </Text>
                )}
              </Box>

              <Divider />

              {/* Head Consultant Approval */}
              <Box>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Head Consultant</Text>
                  <Badge colorScheme={getStatusColor(approvalStatus?.head_consultant?.status || 'pending')}>
                    {approvalStatus?.head_consultant?.status || 'pending'}
                  </Badge>
                </HStack>
                {approvalStatus?.head_consultant?.approved_at && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Disetujui pada: {formatDate(approvalStatus.head_consultant.approved_at)}
                  </Text>
                )}
                {approvalStatus?.head_consultant?.comment && (
                  <Text fontSize="sm" mt={1}>
                    Komentar: {approvalStatus.head_consultant.comment}
                  </Text>
                )}
              </Box>

              <Divider />

              {/* Client Approval */}
              <Box>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Klien</Text>
                  <Badge colorScheme={getStatusColor(approvalStatus?.klien?.status || 'pending')}>
                    {approvalStatus?.klien?.status || 'pending'}
                  </Badge>
                </HStack>
                {approvalStatus?.klien?.approved_at && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Disetujui pada: {formatDate(approvalStatus.klien.approved_at)}
                  </Text>
                )}
                {approvalStatus?.klien?.comment && (
                  <Text fontSize="sm" mt={1}>
                    Komentar: {approvalStatus.klien.comment}
                  </Text>
                )}
              </Box>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ApprovalStatus;
