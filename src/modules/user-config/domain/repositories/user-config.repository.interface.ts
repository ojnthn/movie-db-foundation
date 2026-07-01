import { UserConfig } from '../entities/user-config.entity';

export const USER_CONFIG_REPOSITORY = 'USER_CONFIG_REPOSITORY';

export interface IUserConfigRepository {
  findByUserId(userId: string): Promise<UserConfig | null>;
  update(userId: string, config: UserConfig): Promise<UserConfig>;
}
