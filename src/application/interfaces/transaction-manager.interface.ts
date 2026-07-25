export interface ITransactionManager {
  runInTransaction<T>(work: (tx: unknown) => Promise<T>): Promise<T>;
}
