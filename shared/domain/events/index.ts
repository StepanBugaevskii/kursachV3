export class FileUploadedEvent {
  constructor(public fileId: string, public ownerId: string) {}
}

export class ChunkReceivedEvent {
  constructor(public fileId: string, public index: number) {}
}