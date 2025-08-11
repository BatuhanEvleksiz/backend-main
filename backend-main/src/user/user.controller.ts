import { Controller, Get, Post, Body, Param, Delete, Put, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }
   
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }


  @Get(':email')
  getUserByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }




  @Delete(':email')
  deleteUserByEmail(@Param('email') email: string) {
    return this.userService.deleteByEmail(email);
  }

  @Put(':email')
updateUser(
  @Param('email') email: string,
  @Body(new ValidationPipe()) updatedData: UpdateUserDto
) {
  return this.userService.updateByEmail(email, updatedData);
}
}
