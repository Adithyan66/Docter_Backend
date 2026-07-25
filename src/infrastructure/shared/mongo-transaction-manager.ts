import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { ITransactionManager } from '../../application/interfaces/transaction-manager.interface';

@injectable()
export class MongoTransactionManager implements ITransactionManager {
  async runInTransaction<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await work(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
