import { FileIssue, SVNInfo } from '../types';

export function parseSVNText(text: string): SVNInfo {
   const revisionMatch = text.match(/Revision:\s*(\d+)/);
   const authorMatch = text.match(/Author:\s*([^\n]+)/);
   const dateMatch = text.match(/Date:\s*([^\n]+)/);
   const svnMatch = text.match(/SVN#(\d+)/);

   const modifiedFilesMatches = text.match(/Modified\s*:\s*([^\n]+)/g);
   const modifiedFiles = modifiedFilesMatches
      ? modifiedFilesMatches.map(match => {
         const file = match.replace(/Modified\s*:\s*/, '').trim();
         return file;
      })
      : [];

   return {
      revision: revisionMatch ? revisionMatch[ 1 ] : '',
      author: authorMatch ? authorMatch[ 1 ] : '',
      date: dateMatch ? dateMatch[ 1 ] : '',
      message: text.split('Message:\n')[ 1 ]?.split('----')[ 0 ]?.trim() || '',
      svnId: svnMatch ? svnMatch[ 1 ] : '',
      modifiedFiles
   };
}

export function generateCorrectionText(svnInfo: SVNInfo, issues: FileIssue[]): string {
   if (!issues.length) {
      return 'Por favor, adicione pelo menos um arquivo com problema para gerar o texto.';
   }

   const issuesText = issues.map(issue => {
      const linesArr = issue.lines ? issue.lines.split(',') : [];
      const lineLabel = linesArr.length > 1 ? 'Linhas' : 'Linha';
      const lineValue = issue.lines || '';
      return `\nArquivo: ${issue.filePath}
${lineLabel}: ${lineValue}
${issue.directive || ''}`;
   }).join('');

   return `Boa tarde,

De acordo com as diretrizes de desenvolvimento (http://projetos.sgsistemas.com.br/sgsistemas/wiki/departamentos/departamentos/desenvolvimento/processos/diretrizes-desenvolvimento-deep-fivewin-harbour), solicito que sejam realizadas as seguintes correções:

Ordem de Serviço: ${svnInfo.svnId}
Revisão: ${svnInfo.revision}
${issuesText}
O prazo para a correção é de dois dias úteis.

Atenciosamente,
Tiago Nascimento da Silva.`;
}
