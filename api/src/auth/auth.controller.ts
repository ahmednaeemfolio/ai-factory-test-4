import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { IsNotEmpty, IsString } from "class-validator";
import { AuthService } from "./auth.service";

class CredentialsDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: CredentialsDto) {
    return this.authService.register(dto.username, dto.password);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: CredentialsDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @Post("ghost")
  loginAsGhost() {
    return this.authService.loginAsGhost();
  }
}
