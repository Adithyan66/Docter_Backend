export interface IBackupService {
  createMongoDump(): Promise<string>;
  compressDump(dumpPath: string): Promise<string>;
  cleanup(path: string): Promise<void>;
}

