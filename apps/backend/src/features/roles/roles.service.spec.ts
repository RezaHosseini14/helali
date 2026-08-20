import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ROLE_NAMES } from '@helali/shared';

import { AuditLogsService } from '@/features/audit-logs/audit-logs.service';

import { RolesRepository } from './roles.repository';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  let rolesRepository: jest.Mocked<RolesRepository>;

  const actor = {
    id: 1,
    username: 'admin',
    roleId: 1,
    role: ROLE_NAMES.SUPER,
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '09120000000',
    permissions: ['user.manage-roles'],
  };

  beforeEach(async () => {
    rolesRepository = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      listPermissions: jest.fn(),
      findPermissionsByIds: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<RolesRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RolesRepository, useValue: rolesRepository },
        {
          provide: AuditLogsService,
          useValue: { create: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile();

    service = module.get(RolesService);
  });

  it('rejects creating a role with a reserved system name', async () => {
    await expect(
      service.create(
        {
          name: 'ADMIN',
          description: 'test',
          permissionIds: [1],
        },
        actor,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects updating SUPER permissions', async () => {
    rolesRepository.findById.mockResolvedValue({
      id: 1,
      name: ROLE_NAMES.SUPER,
      description: 'Full access',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [],
      _count: { users: 1 },
    } as never);

    await expect(
      service.update(1, { description: 'changed' }, actor),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects deleting a system role', async () => {
    rolesRepository.findById.mockResolvedValue({
      id: 2,
      name: ROLE_NAMES.ADMIN,
      description: 'Admin',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [],
      _count: { users: 0 },
    } as never);

    await expect(service.remove(2, actor)).rejects.toThrow(BadRequestException);
  });

  it('rejects deleting a role assigned to users', async () => {
    rolesRepository.findById.mockResolvedValue({
      id: 10,
      name: 'ADMIN_AUDIO',
      description: 'Audio admin',
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [],
      _count: { users: 2 },
    } as never);

    await expect(service.remove(10, actor)).rejects.toThrow(BadRequestException);
  });

  it('throws not found for missing role', async () => {
    rolesRepository.findById.mockResolvedValue(null);

    await expect(service.findById(99)).rejects.toThrow(NotFoundException);
  });

  it('creates a custom role when permission ids are valid', async () => {
    rolesRepository.findByName.mockResolvedValue(null);
    rolesRepository.findPermissionsByIds.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    rolesRepository.create.mockResolvedValue({
      id: 20,
      name: 'ADMIN_AUDIO',
      description: 'Audio only',
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        {
          permission: { id: 1, name: 'audio.read', description: 'read' },
        },
        {
          permission: { id: 2, name: 'audio.update', description: 'update' },
        },
      ],
      _count: { users: 0 },
    } as never);

    const role = await service.create(
      {
        name: 'admin-audio',
        description: 'Audio only',
        permissionIds: [1, 2],
      },
      actor,
    );

    expect(role.name).toBe('ADMIN_AUDIO');
    expect(role.permissions).toHaveLength(2);
    expect(rolesRepository.create).toHaveBeenCalledWith({
      name: 'ADMIN_AUDIO',
      description: 'Audio only',
      permissionIds: [1, 2],
    });
  });
});
