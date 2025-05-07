import React from 'react'
import { Box, Typography } from '@mui/material'

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
      }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        MASS Vision  ver 5.0 © 2025 K.S. / EXiTE programming with Cursor. All rights reserved.
      </Typography>
    </Box>
  )
} 