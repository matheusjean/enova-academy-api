export class AmqpConnectionMock {
  publish = jest.fn().mockResolvedValue(undefined);
}
