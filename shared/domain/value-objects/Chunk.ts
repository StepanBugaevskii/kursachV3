export class Chunk {
  constructor(
    public readonly fileId: string,
    public readonly index: number,
    public readonly hash: string,
    public readonly size: number
  ) {}
}