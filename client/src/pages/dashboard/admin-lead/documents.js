// src/pages/dashboard/admin-lead/documents.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Badge,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { ViewIcon, DownloadIcon, DeleteIcon } from '@chakra-ui/icons';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useRouter } from 'next/router';

// Mock data statis untuk testing frontend
const mockUser = {
  id: 1,
  name: 'Admin Lead Mock User',
  role: 'admin_lead',
  email: 'admin.lead@example.com'
};

// Mock documents data
const mockDocuments = [
  {
    id: 1,
    name: 'SLF_Document_Alpha.pdf',
    type: 'SLF',
    size: 2457600, // 2.4 MB
    uploadedBy: 'John Doe',
    uploadedAt: '2023-06-15T10:30:00Z',
    status: 'approved',
    projectId: 1,
    projectName: 'Project Alpha'
  },
  {
    id: 2,
    name: 'Inspection_Report_Beta.docx',
    type: 'Inspection Report',
    size: 1835008, // 1.8 MB
    uploadedBy: 'Jane Smith',
    uploadedAt: '2023-06-10T14:20:00Z',
    status: 'pending',
    projectId: 2,
    projectName: 'Project Beta'
  },
  {
    id: 3,
    name: 'Payment_Proof_Gamma.jpg',
    type: 'Payment Proof',
    size: 3145728, // 3.1 MB
    uploadedBy: 'Bob Johnson',
    uploadedAt: '2023-06-05T09:15:00Z',
    status: 'rejected',
    projectId: 3,
    projectName: 'Project Gamma'
  }
];

// Helper function untuk format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const AdminDocumentsPage = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState(mockDocuments);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const statusColors = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red'
  };

  const handleViewDocument = (documentId) => {
    // Mock view document
    console.log('Viewing document:', documentId);
    toast({
      title: 'View Document',
      description: `Opening document #${documentId} (mock)`,
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  const handleDownloadDocument = (documentId) => {
    // Mock download document
    console.log('Downloading document:', documentId);
    toast({
      title: 'Download Document',
      description: `Downloading document #${documentId} (mock)`,
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  const handleDeleteDocument = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      // Mock delete document
      console.log('Deleting document:', documentId);
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast({
        title: 'Document Deleted',
        description: `Document #${documentId} has been deleted (mock)`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleUploadNewDocument = () => {
    // Mock upload new document
    console.log('Uploading new document');
    toast({
      title: 'Upload Document',
      description: 'Opening upload document form (mock)',
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  return (
    <DashboardLayout user={mockUser}>
      <Box p={6}>
        <HStack justify="space-between" mb={6}>
          <Heading color="blue.600">Document Management</Heading>
          <Button 
            colorScheme="blue" 
            onClick={handleUploadNewDocument}
          >
            Upload New Document
          </Button>
        </HStack>

        <Card>
          <CardBody>
            {documents.length > 0 ? (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Document Name</Th>
                      <Th>Project</Th>
                      <Th>Type</Th>
                      <Th>Size</Th>
                      <Th>Uploaded By</Th>
                      <Th>Uploaded At</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {documents.map(document => (
                      <Tr key={document.id}>
                        <Td>
                          <Text fontWeight="bold">{document.name}</Text>
                        </Td>
                        <Td>{document.projectName}</Td>
                        <Td>{document.type}</Td>
                        <Td>{formatBytes(document.size)}</Td>
                        <Td>{document.uploadedBy}</Td>
                        <Td>{new Date(document.uploadedAt).toLocaleDateString('id-ID')}</Td>
                        <Td>
                          <Badge colorScheme={statusColors[document.status]}>
                            {document.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="View Document">
                              <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                onClick={() => handleViewDocument(document.id)}
                              />
                            </Tooltip>
                            <Tooltip label="Download Document">
                              <IconButton
                                icon={<DownloadIcon />}
                                size="sm"
                                onClick={() => handleDownloadDocument(document.id)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Document">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleDeleteDocument(document.id)}
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
                <AlertTitle>No Documents Found</AlertTitle>
                <AlertDescription>
                  There are no documents uploaded yet.
                </AlertDescription>
              </Alert>
            )}
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AdminDocumentsPage;

export async function getStaticProps() {
  return {
    props: {} // Kosongkan karena semua data di-mock di komponen
  };
}