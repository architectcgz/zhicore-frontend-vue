import { describe, expect, it } from 'vitest';
import { parseJsonPreservingLargeIntegers } from '@/utils/request';

describe('parseJsonPreservingLargeIntegers', () => {
  it('preserves unsafe integer ids as strings', () => {
    const payload = '{"code":200,"data":{"id":160300433435271168,"ownerId":160300433431076865,"title":"test"},"success":true}';
    const parsed = parseJsonPreservingLargeIntegers<{
      code: number;
      data: {
        id: string;
        ownerId: string;
        title: string;
      };
      success: boolean;
    }>(payload);

    expect(parsed.data.id).toBe('160300433435271168');
    expect(parsed.data.ownerId).toBe('160300433431076865');
    expect(typeof parsed.data.id).toBe('string');
    expect(parsed.data.title).toBe('test');
  });

  it('preserves unsafe integers inside arrays', () => {
    const payload = '{"code":200,"data":[160300433435271168,160300433435271172],"success":true}';
    const parsed = parseJsonPreservingLargeIntegers<{
      code: number;
      data: string[];
      success: boolean;
    }>(payload);

    expect(parsed.data).toEqual([
      '160300433435271168',
      '160300433435271172',
    ]);
  });

  it('keeps safe integers as numbers', () => {
    const payload = '{"code":200,"timestamp":1773923322402,"data":{"rank":7},"success":true}';
    const parsed = parseJsonPreservingLargeIntegers<{
      code: number;
      timestamp: number;
      data: { rank: number };
      success: boolean;
    }>(payload);

    expect(parsed.timestamp).toBe(1773923322402);
    expect(typeof parsed.timestamp).toBe('number');
    expect(parsed.data.rank).toBe(7);
  });
});
