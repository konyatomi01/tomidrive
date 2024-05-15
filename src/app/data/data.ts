export interface IFolder {
  id: string;
  name: string;
  path_display: string;
  path_lower: string;
}
export interface IFile {
  id: string;
  name: string;
  path_display: string;
  path_lower: string;
  size: number;
  client_modified: string;
}