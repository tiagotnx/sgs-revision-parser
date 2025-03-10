import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';
import SVNParser from './components/SVNParser';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <SVNParser />
      </ChakraProvider>
    </>
  );
}

export default App;
