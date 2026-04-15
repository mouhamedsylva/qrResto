import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, restaurantName } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 1. Créer le restaurant
    const restaurant = this.restaurantRepository.create({
      name: restaurantName,
    });
    const savedRestaurant = await this.restaurantRepository.save(restaurant);

    // 2. Créer l'utilisateur (OWNER) lié au restaurant
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      role: UserRole.OWNER,
      restaurant: savedRestaurant,
    });

    await this.userRepository.save(user);
    return this.generateToken(user);
  }

  async login(loginData: any) {
    const user = await this.validateUser(loginData.email, loginData.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .leftJoinAndSelect('user.restaurant', 'restaurant')
      .getOne();

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }


  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: 'refreshsecret', // Should be from config
      });
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['restaurant'],
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      return this.generateToken(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateToken(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      restaurantId: user.restaurant?.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        restaurant: user.restaurant,
      },
    };
  }
}
