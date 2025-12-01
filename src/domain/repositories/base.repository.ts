export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: T, session?: any): Promise<T>;
  update(id: string, entity: Partial<T>, session?: any): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
