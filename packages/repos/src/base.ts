import { randomUUID } from 'node:crypto';
import type { DB } from './db';

export abstract class BaseRepo {
  private static _lastTs = 0;

  constructor(public db: DB) {}

  protected generateId() {
    return randomUUID();
  }

  protected generateTimestamp(): number {
    const ts = Date.now();
    if (ts <= BaseRepo._lastTs) {
      BaseRepo._lastTs += 1;
      return BaseRepo._lastTs;
    }
    BaseRepo._lastTs = ts;
    return ts;
  }
}
