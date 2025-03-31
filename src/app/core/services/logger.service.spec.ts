import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  const service: LoggerService = new LoggerService();

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('info', () => {
    let consoleLogSpy: jasmine.Spy;

    beforeEach(() => {
      consoleLogSpy = spyOn(console, 'log');
    });

    it('should call console.log with the provided message', () => {
      const message = 'Test info message';

      service.info(message);

      expect(consoleLogSpy).toHaveBeenCalledWith(message);
    });

    it('should pass all parameters to console.log', () => {
      const message = 'Test with params: %s and %d';
      const param1 = 'string';
      const param2 = 42;

      service.info(message, param1, param2);

      expect(consoleLogSpy).toHaveBeenCalledWith(message, param1, param2);
    });

    it('should handle object parameters', () => {
      const message = 'Test with object:';
      const testObject = { name: 'test', value: 123 };

      service.info(message, testObject);

      expect(consoleLogSpy).toHaveBeenCalledWith(message, testObject);
    });

    it('should handle multiple calls', () => {
      service.info('First message');
      service.info('Second message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenCalledWith('First message');
      expect(consoleLogSpy).toHaveBeenCalledWith('Second message');
    });
  });

  describe('warning', () => {
    let consoleWarnSpy: jasmine.Spy;

    beforeEach(() => {
      consoleWarnSpy = spyOn(console, 'warn');
    });

    it('should call console.warn with the provided message', () => {
      const message = 'Test warning message';

      service.warning(message);

      expect(consoleWarnSpy).toHaveBeenCalledWith(message);
    });
  });

  describe('error', () => {
    let consoleErrorSpy: jasmine.Spy;

    beforeEach(() => {
      consoleErrorSpy = spyOn(console, 'error');
    });

    it('should call console.error with the provided message', () => {
      const message = 'Test error message';

      service.error(message);

      expect(consoleErrorSpy).toHaveBeenCalledWith(message);
    });
  });
});
