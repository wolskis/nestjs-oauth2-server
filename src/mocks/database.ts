const mock = () => {
    const mClient = {
      query: jest.fn(),
      end: jest.fn(),
      release: jest.fn()
    }
    const mPool = {
      connect: jest.fn(() => mClient),
      query: jest.fn(),
      end: jest.fn(),
      release: jest.fn()
    };
    return { 
      Pool: jest.fn(() => mPool),
      Client: jest.fn(() => mClient)
    };
}

export default mock;