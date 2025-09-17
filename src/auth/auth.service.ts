import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: { email: string; name: string; password: string }) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new UnauthorizedException('Email already registered');
    const password = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, password },
    });
    return this.issue(user);
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.password, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issue(user);
  }

  private issue(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwt.sign(payload) };
  }
}
