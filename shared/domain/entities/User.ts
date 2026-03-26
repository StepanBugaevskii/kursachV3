export class User {
  constructor(
    public readonly id: string,
    public displayName: string,
    public email?: string,
    public avatarUrl?: string,
    public createdAt: Date = new Date()
  ) {}

  updateProfile(name: string, avatar?: string) {
    this.displayName = name;
    if (avatar) this.avatarUrl = avatar;
  }
}