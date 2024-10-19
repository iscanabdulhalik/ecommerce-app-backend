import { Role } from 'src/common/enums/role.enum';

export interface JwtPayload {
  user: {
    userId: string;
    role: Role;
    email: string;
  };
}
