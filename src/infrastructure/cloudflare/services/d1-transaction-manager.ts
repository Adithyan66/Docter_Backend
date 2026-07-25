import { injectable } from 'tsyringe';
import { ITransactionManager } from '../../../application/interfaces/transaction-manager.interface';

/**
 * D1's Workers binding has no interactive multi-statement transactions (no
 * BEGIN/COMMIT across awaits). Work runs sequentially; single statements are
 * atomic but there is no cross-step rollback. Use-cases order steps so a partial
 * failure is recoverable rather than corrupting.
 */
@injectable()
export class D1TransactionManager implements ITransactionManager {
  async runInTransaction<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
    return work(undefined);
  }
}
