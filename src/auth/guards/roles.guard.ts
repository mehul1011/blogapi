import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService)) // This means that instead of injecting actual instances of A and B, we inject the providers/factories responsible for creating instances of them (a solution for resolving the circular dependencies)
    private userService: UserService,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: User = request.user.user;
    return this.userService.findOne(user.id).pipe(
      map((user: User) => {
        const hasRoles = () => roles.indexOf(user.role) > -1;
        let hasPermission: boolean = false;
        if (hasRoles()) {
          hasPermission = true;
        }
        return user && hasPermission;
      }),
    );
  }
}
