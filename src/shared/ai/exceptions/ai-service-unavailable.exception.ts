export class AiServiceUnavailableException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiServiceUnavailableException';
  }
}
