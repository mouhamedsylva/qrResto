import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Logic: check if user.restaurant.subscriptions has at least one ACTIVE subscription
    // For now, allow if the user has a restaurant linked. 
    // In a real scenario, we would check the database or the user object's restaurant status.
    if (!user || !user.restaurant) {
      throw new ForbiddenException('No restaurant context found');
    }

    // This is a placeholder for real subscription validation logic
    // const hasActiveSubscription = user.restaurant.subscriptions?.some(s => s.status === 'active');
    // return hasActiveSubscription;

    return true; 
  }
}
