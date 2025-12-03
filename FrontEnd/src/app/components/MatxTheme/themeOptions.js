import { red } from '@mui/material/colors';
import { components } from './components';

const themeOptions = {
  typography: {
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Poppins', sans-serif" },
    h2: { fontFamily: "'Poppins', sans-serif" },
    h3: { fontFamily: "'Poppins', sans-serif" },
    h4: { fontFamily: "'Poppins', sans-serif" },
    h5: { fontFamily: "'Poppins', sans-serif" },
    h6: { fontFamily: "'Poppins', sans-serif" },
    body1: { fontSize: '14px' },
  },

  status: { danger: red[500] },
  shape: {
    borderRadius: 10,
  },
  components: { ...components },
};

export default themeOptions;
