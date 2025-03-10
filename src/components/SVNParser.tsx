import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Textarea,
  VStack,
  Text,
  useToast,
  IconButton,
  HStack,
  Divider,
  Card,
  CardBody,
  CardHeader,
  useColorMode,
} from '@chakra-ui/react';
import { CloseIcon, AddIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import { parseSVNText, generateCorrectionText } from '../utils/parser';
import { SVNInfo, FileIssue } from '../types';

const SVNParser: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [svnInfo, setSvnInfo] = useState<SVNInfo | null>(null);
  const [issues, setIssues] = useState<FileIssue[]>([]);
  const [outputText, setOutputText] = useState('');
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleParse = () => {
    try {
      const parsed = parseSVNText(inputText);
      setSvnInfo(parsed);
      setIssues([]);
      toast({
        title: 'Texto analisado com sucesso',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Erro ao analisar o texto',
        description: 'O formato do texto pode estar incorreto',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const addIssue = () => {
    const newIssue: FileIssue = {
      id: uuidv4(),
      filePath: svnInfo?.modifiedFiles[0] || '',
      lines: '',
      directive: '',
    };
    setIssues([...issues, newIssue]);
  };

  const removeIssue = (id: string) => {
    setIssues(issues.filter(issue => issue.id !== id));
  };

  const updateIssue = (id: string, field: keyof FileIssue, value: string) => {
    setIssues(
      issues.map(issue =>
        issue.id === id ? { ...issue, [field]: value } : issue
      )
    );
  };

  const handleGenerateText = () => {
    if (!svnInfo) {
      toast({
        title: 'Informação SVN não disponível',
        description: 'Por favor, analise o texto SVN primeiro',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const text = generateCorrectionText(svnInfo, issues);
    setOutputText(text);
  };

  const addFile = () => {
    if (!svnInfo) return;
    const newFiles = [...svnInfo.modifiedFiles, ''];
    setSvnInfo({ ...svnInfo, modifiedFiles: newFiles });
  };

  const updateFile = (index: number, value: string) => {
    if (!svnInfo) return;
    const newFiles = [...svnInfo.modifiedFiles];
    newFiles[index] = value;
    setSvnInfo({ ...svnInfo, modifiedFiles: newFiles });
  };

  const removeFile = (index: number) => {
    if (!svnInfo) return;
    const newFiles = [...svnInfo.modifiedFiles];
    newFiles.splice(index, 1);
    setSvnInfo({ ...svnInfo, modifiedFiles: newFiles });
  };

  return (
    <Container maxW="container.xl" py={5}>
      <VStack spacing={6} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="xl">
            Parser de Revisão SVN
          </Heading>
          <IconButton
            aria-label={colorMode === 'light' ? 'Modo escuro' : 'Modo claro'}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            size="md"
          />
        </Flex>

        <Box>
          <FormControl isRequired>
            <FormLabel>Texto da Revisão SVN</FormLabel>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Cole o texto da revisão SVN aqui..."
              size="lg"
              h="300px"
              mb={3}
            />
            <Button colorScheme="gray" onClick={handleParse}>
              Analisar Texto
            </Button>
          </FormControl>
        </Box>

        {svnInfo && (
          <Card variant="outline">
            <CardHeader>
              <Heading size="md">Informações da Revisão</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Flex gap={4} flexWrap="wrap">
                  <FormControl>
                    <FormLabel>Revisão</FormLabel>
                    <Input
                      value={svnInfo.revision}
                      onChange={(e) => setSvnInfo({...svnInfo, revision: e.target.value})}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Autor</FormLabel>
                    <Input
                      value={svnInfo.author}
                      onChange={(e) => setSvnInfo({...svnInfo, author: e.target.value})}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>SVN#</FormLabel>
                    <Input
                      value={svnInfo.svnId}
                      onChange={(e) => setSvnInfo({...svnInfo, svnId: e.target.value})}
                    />
                  </FormControl>
                </Flex>

                <FormControl>
                  <FormLabel>Data</FormLabel>
                  <Input
                    value={svnInfo.date}
                    onChange={(e) => setSvnInfo({...svnInfo, date: e.target.value})}
                  />
                </FormControl>

                <Divider />

                <FormControl>
                  <FormLabel>Arquivos Modificados</FormLabel>
                  <VStack align="stretch" spacing={2}>
                    {svnInfo.modifiedFiles.map((file, index) => (
                      <HStack key={index}>
                        <Input
                          value={file}
                          onChange={(e) => updateFile(index, e.target.value)}
                        />
                        <IconButton
                          aria-label="Remover arquivo"
                          icon={<CloseIcon />}
                          colorScheme="red"
                          size="sm"
                          onClick={() => removeFile(index)}
                        />
                      </HStack>
                    ))}
                    <Button
                      leftIcon={<AddIcon />}
                      variant="outline"
                      onClick={addFile}
                      alignSelf="flex-start"
                    >
                      Adicionar Arquivo
                    </Button>
                  </VStack>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        )}

        {svnInfo && (
          <Card variant="outline">
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md">Problemas e Diretrizes</Heading>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="gray"
                  onClick={addIssue}
                >
                  Adicionar Problema
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                {issues.map((issue, index) => (
                  <Box
                    key={issue.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    position="relative"
                  >
                    <IconButton
                      aria-label="Remover problema"
                      icon={<CloseIcon />}
                      size="sm"
                      colorScheme="red"
                      position="absolute"
                      top={2}
                      right={2}
                      onClick={() => removeIssue(issue.id)}
                    />

                    <Text fontWeight="bold" mb={2}>Problema {index + 1}</Text>

                    <FormControl mb={3}>
                      <FormLabel>Arquivo</FormLabel>
                      <Input
                        value={issue.filePath}
                        onChange={(e) => updateIssue(issue.id, 'filePath', e.target.value)}
                        placeholder="/caminho/para/arquivo.prg"
                      />
                    </FormControl>

                    <FormControl mb={3}>
                      <FormLabel>Linhas</FormLabel>
                      <Input
                        value={issue.lines}
                        onChange={(e) => updateIssue(issue.id, 'lines', e.target.value)}
                        placeholder="Ex: 123 ou 123, 124, 125"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Diretriz não atendida</FormLabel>
                      <Textarea
                        value={issue.directive}
                        onChange={(e) => updateIssue(issue.id, 'directive', e.target.value)}
                        placeholder="Ex: 7. Colocar um espaço antes de cada parâmetro de uma função..."
                      />
                    </FormControl>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {svnInfo && (
          <Box>
            <Button
              colorScheme="gray"
              size="lg"
              onClick={handleGenerateText}
              isDisabled={issues.length === 0}
              mb={4}
            >
              Gerar Texto de Correção
            </Button>

            {outputText && (
              <Box>
                <FormControl>
                  <FormLabel>Texto Gerado</FormLabel>
                  <Textarea
                    value={outputText}
                    readOnly
                    height="300px"
                    fontFamily="monospace"
                  />
                </FormControl>
                <Button
                  colorScheme="gray"
                  mt={2}
                  onClick={() => {
                    navigator.clipboard.writeText(outputText);
                    toast({
                      title: 'Texto copiado',
                      status: 'success',
                      duration: 2000,
                    });
                  }}
                >
                  Copiar para Área de Transferência
                </Button>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default SVNParser;
