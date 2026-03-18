import { describe, expect, it } from 'vitest';
import { normalizeAdminUser, normalizePageResponse } from '@/api/admin';

describe('admin api adapters', () => {
  it('normalizes backend user data to frontend user shape', () => {
    const normalized = normalizeAdminUser({
      id: 1001,
      username: 'alice',
      email: 'alice@example.com',
      nickname: 'Alice',
      avatar: '',
      status: 'NORMAL',
      createdAt: '2026-03-17T10:00:00',
      roles: ['ROLE_ADMIN'],
    });

    expect(normalized).toEqual({
      id: '1001',
      username: 'alice',
      email: 'alice@example.com',
      nickname: 'Alice',
      avatar: '',
      status: 'NORMAL',
      createdAt: '2026-03-17T10:00:00',
      roles: ['ROLE_ADMIN'],
    });
  });

  it('maps backend PageResult to frontend PageResponse', () => {
    const page = normalizePageResponse(
      {
        current: 2,
        size: 20,
        total: 41,
        pages: 3,
        hasNext: true,
        records: [
          {
            id: 7,
            username: 'bob',
            email: 'bob@example.com',
            nickname: 'Bob',
            avatar: undefined,
            status: 'FORBIDDEN',
            createdAt: '2026-03-16T09:00:00',
            roles: ['ROLE_USER'],
          },
        ],
      },
      normalizeAdminUser
    );

    expect(page).toEqual({
      items: [
        {
          id: '7',
          username: 'bob',
          email: 'bob@example.com',
          nickname: 'Bob',
          avatar: '',
          status: 'FORBIDDEN',
          createdAt: '2026-03-16T09:00:00',
          roles: ['ROLE_USER'],
        },
      ],
      total: 41,
      page: 2,
      size: 20,
      hasMore: true,
    });
  });
});
