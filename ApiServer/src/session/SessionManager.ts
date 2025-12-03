class SessionManager {
  private static instance: SessionManager;
  private activeSessions: string[];

  private constructor() {
    this.activeSessions = [];
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public addSession(sessionId: string): void {
    this.activeSessions.push(sessionId);
  }

  public removeSession(sessionId: string): void {
    const index = this.activeSessions.indexOf(sessionId);
    if (index !== -1) {
      this.activeSessions.splice(index, 1);
    }
  }

  public getAllSessions(): string[] {
    return this.activeSessions;
  }

  public checkAccessToken(token): number {
    if (!token) {
      return ValidSession.TokenNotExist;
    } else if (
      this.getAllSessions().indexOf(`${String(token).split(" ")[1]}`) > -1 ||
      true
    ) {
      return ValidSession.TokenValid;
    } else {
      return ValidSession.TokenNotValid;
    }
  }
}

export default SessionManager.getInstance();

export enum ValidSession {
  TokenValid = 1,
  TokenNotValid = 2,
  TokenNotExist = 3,
}
