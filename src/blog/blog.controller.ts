import { Controller, Get, Inject, Post, Query, Body, UseGuards , Param, Headers, UnauthorizedException} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BlogDto } from './blog.dto';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/guard/auth.guard';
import { FilterBlogsDto } from './blog-filters.dto';
import { ConfigService } from '@nestjs/config';

@Controller('blog')
export class BlogController {
  constructor(
    @Inject('BLOG_SERVICE') private readonly blogService: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    private _configService: ConfigService
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllBlogs(@Query() filters: FilterBlogsDto) {
    return this.blogService.send({ service: this._configService.get('BLOG_SERVICE_NAME'), cmd: 'get-all-blogs' }, { ...filters });
  }

  @Post()
  @UseGuards(AuthGuard)
  async createBlog(@Body() createBlogDto: BlogDto) {
    // Controllo che l'utente esista
    const user = await firstValueFrom(this.authService.send({ service: this._configService.get('AUTH_SERVICE_NAME'), cmd: 'get-user' }, createBlogDto.user_id ));
    if (!user) {
      throw new UnauthorizedException();
    }
    // Invia i dati al microservizio Blog
    return this.blogService.send({ service: this._configService.get('BLOG_SERVICE_NAME'), cmd: 'create-blog' }, createBlogDto);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async getBlogsUser(@Headers('Authorization') token: string, @Query() filters: FilterBlogsDto) {
    //Recupero l'utente dal servizio di auth
    const user = await firstValueFrom(this.authService.send({ service: this._configService.get('AUTH_SERVICE_NAME'), cmd: 'get-me' }, { token: token?.replace('Bearer ', '') }));

    // Recupero i blog dell'utente
    return this.blogService.send({ service: this._configService.get('BLOG_SERVICE_NAME'), cmd: 'get-user-blogs' }, { user_id: user._id, ...filters });
  }
}
