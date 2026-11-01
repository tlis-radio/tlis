export interface NmsSessionEvent {
  id: string;
  streamPath?: string;
  streamName?: string;
  streamApp?: string;
  close?: () => void;
}

export function getStreamId(session: NmsSessionEvent): string | null {
  if (session.streamName && session.streamName.length > 0) {
    return session.streamName;
  }

  if (session.streamPath && session.streamPath.length > 0) {
    const segments = session.streamPath.split("/").filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : null;
  }

  return null;
}

export function closeSession(session: NmsSessionEvent): void {
  if (typeof session.close === "function") {
    session.close();
  }
}
