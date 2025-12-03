export function getFilesAndFolders(pathDetails: Folder, path: string) {
  const pathParts = path.split("/").filter(Boolean);
  let currentLevel: Folder | undefined = pathDetails;

  for (const part of pathParts) {
    if (currentLevel && currentLevel[part]) {
      currentLevel = currentLevel[part] as Folder;
    } else {
      // If path part does not exist, return empty result
      return { files: [], folders: [] };
    }
  }

  // Extract files and subfolders from the current level
  const files = currentLevel.files || [];
  const folders = Object.keys(currentLevel).filter((key) => key !== "files");

  return { files, folders };
}

export type FileDetail = {
  uploadId: number;
  documentType: string;
  dateTime: string;
  path: string;
};

export type Folder = {
  files?: FileDetail[];
  [key: string]: Folder | FileDetail[] | undefined;
};

export type PathDetailsResponse = {
  success: boolean;
  data: FileDetail[];
  pathDetails: Folder;
};
