import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { UserService } from '../../user/service/user.service';
import { User, UserRole } from 'src/user/models/user.interface';

@Injectable()
export class UserIsUserGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params; // from url /user/7
    const user: User = request.user;
    return this.userService.findOne(user.id).pipe(
      map((user: User) => {
        const hasRoles = () => user.role;
        const doesHaveRole = Object.values(UserRole).includes(hasRoles());
        let hasPermission = false;
        console.log(doesHaveRole, user.id, params.id);
        if (doesHaveRole && user.id === Number(params.id)) {
          hasPermission = true;
        }
        console.log(user, hasPermission);
        return user && hasPermission;
      }),
      // console.log(request.user.user);
    );
  }
}
