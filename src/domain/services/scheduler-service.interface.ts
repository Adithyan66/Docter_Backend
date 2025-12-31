export interface ISchedulerService {
  schedule(cronExpression: string, task: () => Promise<void>): void;
  start(): void;
  stop(): void;
}

