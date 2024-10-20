import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!roles) {
      return false; // Eğer bir rol tanımlı değilse, geçişe izin verilmez
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user; // request.user ile kullanıcının rolünü alıyoruz

    return roles.includes(user.role); // Kullanıcının rolü gerekli rollerde var mı diye kontrol ediyoruz
  }
}
