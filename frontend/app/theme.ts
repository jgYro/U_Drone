import { createTheme, alpha } from '@mui/material/styles';

// Cyber color palette
const cyberColors = {
  neonCyan: '#00FFFF',
  neonPink: '#FF10F0',
  neonPurple: '#9D00FF',
  neonGreen: '#39FF14',
  darkBlue: '#0a0e27',
  deepSpace: '#050511',
  electricBlue: '#00D4FF',
  holographicSilver: '#E0E5EC',
  matrixGreen: '#00FF41',
  warningOrange: '#FF6B35',
  glowWhite: '#FFFFFF',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: cyberColors.neonCyan,
      light: cyberColors.electricBlue,
      dark: '#0088AA',
      contrastText: cyberColors.deepSpace,
    },
    secondary: {
      main: cyberColors.neonPink,
      light: '#FF66F6',
      dark: cyberColors.neonPurple,
      contrastText: cyberColors.glowWhite,
    },
    background: {
      default: cyberColors.deepSpace,
      paper: alpha(cyberColors.darkBlue, 0.8),
    },
    text: {
      primary: cyberColors.glowWhite,
      secondary: cyberColors.holographicSilver,
    },
    success: {
      main: cyberColors.matrixGreen,
      light: cyberColors.neonGreen,
      dark: '#00CC33',
    },
    warning: {
      main: cyberColors.warningOrange,
      light: '#FF8C61',
      dark: '#CC4A1A',
    },
    error: {
      main: '#FF073A',
      light: '#FF3860',
      dark: '#CC002E',
    },
    divider: alpha(cyberColors.neonCyan, 0.2),
  },
  typography: {
    fontFamily: [
      'Orbitron',
      'Rajdhani',
      'Share Tech Mono',
      'monospace',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      textShadow: `0 0 20px ${cyberColors.neonCyan}`,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      textShadow: `0 0 15px ${cyberColors.neonCyan}`,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
      textShadow: `0 0 10px ${cyberColors.neonCyan}`,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      textShadow: `0 0 8px ${cyberColors.neonCyan}`,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      textShadow: `0 0 6px ${cyberColors.neonCyan}`,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      textShadow: `0 0 5px ${cyberColors.neonCyan}`,
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `
            radial-gradient(ellipse at top, ${alpha(cyberColors.darkBlue, 0.5)}, transparent),
            radial-gradient(ellipse at bottom, ${alpha(cyberColors.neonPurple, 0.1)}, transparent)
          `,
          backgroundAttachment: 'fixed',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                ${alpha(cyberColors.neonCyan, 0.03)} 2px,
                ${alpha(cyberColors.neonCyan, 0.03)} 4px
              )
            `,
            pointerEvents: 'none',
            zIndex: 1,
          },
        },
        '@keyframes glow': {
          '0%, 100%': {
            boxShadow: `0 0 20px ${alpha(cyberColors.neonCyan, 0.8)}`,
          },
          '50%': {
            boxShadow: `0 0 30px ${alpha(cyberColors.neonCyan, 1)}`,
          },
        },
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.7,
          },
        },
        '@keyframes flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
            opacity: 1,
          },
          '20%, 24%, 55%': {
            opacity: 0.4,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px solid ${cyberColors.neonCyan}`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha(cyberColors.neonCyan, 0.3)}, transparent)`,
            transition: 'left 0.5s ease',
          },
          '&:hover': {
            boxShadow: `
              0 0 20px ${alpha(cyberColors.neonCyan, 0.8)},
              inset 0 0 20px ${alpha(cyberColors.neonCyan, 0.2)}
            `,
            borderColor: cyberColors.electricBlue,
            transform: 'translateY(-2px)',
            '&::before': {
              left: '100%',
            },
          },
        },
        contained: {
          background: `linear-gradient(45deg, ${cyberColors.darkBlue}, ${alpha(cyberColors.neonCyan, 0.3)})`,
          border: `1px solid ${cyberColors.neonCyan}`,
          '&:hover': {
            background: `linear-gradient(45deg, ${alpha(cyberColors.neonCyan, 0.2)}, ${alpha(cyberColors.electricBlue, 0.4)})`,
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: alpha(cyberColors.neonCyan, 0.1),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: alpha(cyberColors.darkBlue, 0.9),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(cyberColors.neonCyan, 0.3)}`,
          borderRadius: 0,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${cyberColors.neonCyan}, transparent)`,
            animation: 'pulse 2s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${cyberColors.neonPink}, transparent)`,
            animation: 'pulse 2s ease-in-out infinite',
            animationDelay: '1s',
          },
        },
        elevation1: {
          boxShadow: `0 0 20px ${alpha(cyberColors.neonCyan, 0.2)}`,
        },
        elevation2: {
          boxShadow: `0 0 30px ${alpha(cyberColors.neonCyan, 0.3)}`,
        },
        elevation3: {
          boxShadow: `0 0 40px ${alpha(cyberColors.neonCyan, 0.4)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px solid ${alpha(cyberColors.neonCyan, 0.4)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `
              0 10px 40px ${alpha(cyberColors.neonCyan, 0.4)},
              inset 0 0 30px ${alpha(cyberColors.neonPurple, 0.1)}
            `,
            borderColor: cyberColors.electricBlue,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            '& fieldset': {
              borderColor: alpha(cyberColors.neonCyan, 0.5),
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: cyberColors.neonCyan,
            },
            '&.Mui-focused fieldset': {
              borderColor: cyberColors.electricBlue,
              boxShadow: `0 0 10px ${alpha(cyberColors.electricBlue, 0.5)}`,
            },
          },
          '& .MuiInputBase-input': {
            color: cyberColors.glowWhite,
            '&::placeholder': {
              color: alpha(cyberColors.holographicSilver, 0.5),
            },
          },
          '& .MuiInputLabel-root': {
            color: cyberColors.holographicSilver,
            '&.Mui-focused': {
              color: cyberColors.electricBlue,
            },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.glow': {
            animation: 'flicker 3s linear infinite',
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${alpha(cyberColors.neonCyan, 0.1)}`,
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: alpha(cyberColors.neonCyan, 0.1),
            paddingLeft: '24px',
            '& .MuiListItemIcon-root': {
              color: cyberColors.electricBlue,
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: alpha(cyberColors.matrixGreen, 0.1),
          borderColor: cyberColors.matrixGreen,
        },
        standardError: {
          backgroundColor: alpha('#FF073A', 0.1),
          borderColor: '#FF073A',
        },
        standardWarning: {
          backgroundColor: alpha(cyberColors.warningOrange, 0.1),
          borderColor: cyberColors.warningOrange,
        },
        standardInfo: {
          backgroundColor: alpha(cyberColors.electricBlue, 0.1),
          borderColor: cyberColors.electricBlue,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: cyberColors.neonCyan,
        },
      },
    },
  },
});

export default theme;