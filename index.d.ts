declare module 'node-is-piped' {
  type IsPipedResult = {
    piped: boolean;
    confident: boolean;
  }

  interface IsPipedInterface {
    in(fileDescriptor: number): IsPipedResult;
    out(fileDescriptor: number): IsPipedResult;
  }

  const isPiped: IsPipedInterface;

  export default isPiped;
}
