export interface UvWorkspaceConfig {
  members: string[];
  exclude?: string[];
}

export interface PyProjectToml {
  project?: {
    name: string;
    dependencies?: string[];
  };
  tool?: {
    uv?: {
      workspace?: UvWorkspaceConfig;
      sources?: Record<string, { workspace?: boolean }>;
    };
  };
}

export interface WorkspaceFile {
  folders: Array<{ name: string; path: string }>;
  settings?: Record<string, unknown>;
}

export interface DependencyGraph {
  [folderName: string]: string[];
}
