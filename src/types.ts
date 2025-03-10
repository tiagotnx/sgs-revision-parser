export interface SVNInfo {
  revision: string;
  author: string;
  date: string;
  message: string;
  svnId: string;
  modifiedFiles: string[];
}

export interface FileIssue {
  id: string;
  filePath: string;
  lines: string;
  directive: string;
}
