import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router'; // Menggunakan router dari Next.js

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const IntroPage = () => { // Mengubah nama komponen agar sesuai
  const router = useRouter(); // Menggunakan hook dari Next.js
  const [showIntro, setShowIntro] = useState(true);

  const handleStart = () => {
    setShowIntro(false); // Memicu animasi fade-out
    setTimeout(() => router.push('/login'), 500); // Tunggu fade-out sebelum pindah halaman
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleStart();
    }, 5000); // Otomatis pindah setelah 5 detik
    return () => clearTimeout(timer);
  }, []); // Dependency array kosong agar hanya berjalan sekali

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.6,
      },
    },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 1 },
    },
  };

  return (
    <AnimatePresence>
      {showIntro && (
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minH="100vh"
          textAlign="center"
          bgGradient="linear(to-r, blue.800, blue.500)"
          p={4}
          color="white"
        >
          {/* Heading utama */}
          <MotionHeading
            as="h1"
            size="4xl"
            mb={4}
            fontWeight="extrabold"
            variants={itemVariants}
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            SLF <Box as="span" color="blue.200">ONE</Box>
          </MotionHeading>

          {/* Subheading */}
          <MotionText
            fontSize="lg"
            mb={2}
            variants={itemVariants}
            letterSpacing="wide"
          >
            Powered By <Box as="span" fontWeight="bold" color="blue.200">Puri Dimensi</Box>
          </MotionText>

          {/* Deskripsi */}
          <MotionText
            fontSize="xl"
            mb={8}
            maxW="lg"
            variants={itemVariants}
            color="blue.100"
          >
            Trusted Over <Box as="span" fontWeight="bold" color="white">600</Box> Leading Clients
          </MotionText>

          {/* Tombol skip/start */}
          <MotionButton
            onClick={handleStart}
            size="lg"
            bg="blue.400"
            color="white"
            _hover={{ bg: 'blue.300', boxShadow: '0px 0px 15px rgba(59, 130, 246, 0.8)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            variants={itemVariants}
          >
            Mulai Sekarang
          </MotionButton>
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

export default IntroPage;
