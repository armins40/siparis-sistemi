import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { TenantService } from '../../modules/tenant/tenant.service';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private configService;
    private tenantService;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService, tenantService: TenantService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    validateUser(userId: string): Promise<User | null>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    private generateTokens;
    requestPasswordReset(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
}
