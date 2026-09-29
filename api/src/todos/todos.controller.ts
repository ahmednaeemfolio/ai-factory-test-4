import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnprocessableEntityException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { IsNotEmpty, IsString } from "class-validator";
import { Request } from "express";
import { AuthGuard } from "../auth/auth.guard";
import { TodoItem, TodosService } from "./todos.service";

class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}

interface AuthenticatedRequest extends Request {
  userId: string;
}

@Controller("todos")
@UseGuards(AuthGuard)
@UsePipes(
  new ValidationPipe({
    exceptionFactory: () => new UnprocessableEntityException(),
  }),
)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  listItems(@Req() request: AuthenticatedRequest): { items: TodoItem[] } {
    return { items: this.todosService.listItems(request.userId) };
  }

  @Post()
  addItem(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateTodoDto,
  ): TodoItem {
    return this.todosService.addItem(request.userId, body.text);
  }
}
