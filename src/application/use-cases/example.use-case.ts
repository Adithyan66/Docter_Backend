import { injectable } from 'tsyringe';

@injectable()
export class ExampleUseCase {
  async execute(data: { name: string; email: string }): Promise<{ id: string; name: string; email: string }> {
    return {
      id: '1',
      name: data.name,
      email: data.email,
    };
  }
}
