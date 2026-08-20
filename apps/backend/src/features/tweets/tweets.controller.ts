import {

  Body,

  Controller,

  Get,

  Param,

  ParseIntPipe,

  Patch,

  Query,

} from '@nestjs/common';



import { CheckAbility } from '@/shared/decorators/check-ability.decorator';

import { Public } from '@/shared/decorators/public.decorator';

import { PaginationDto } from '@/shared/dto/pagination.dto';



import { UpdateTweetPublishedDto } from './dto/update-tweet-published.dto';

import { TweetsService } from './tweets.service';



@Controller('tweets')

export class TweetsController {

  constructor(private readonly tweetsService: TweetsService) {}



  @Public()

  @Get()

  async findLatest(@Query('limit') limitRaw?: string) {

    const limit = limitRaw ? Number(limitRaw) : undefined;

    const data = await this.tweetsService.findLatest(limit);



    return {

      message: 'توییت‌ها دریافت شد',

      data,

    };

  }



  @Get('admin')

  @CheckAbility({ action: 'read', subject: 'Tweet' })

  async findAllAdmin(@Query() query: PaginationDto) {

    const data = await this.tweetsService.findAllAdmin(query.page, query.limit);



    return {

      message: 'لیست توییت‌ها دریافت شد',

      data,

    };

  }



  @Patch(':id/published')

  @CheckAbility({ action: 'update', subject: 'Tweet' })

  async updatePublished(

    @Param('id', ParseIntPipe) id: number,

    @Body() dto: UpdateTweetPublishedDto,

  ) {

    const data = await this.tweetsService.updatePublished(id, dto.isPublished);



    return {

      message: dto.isPublished ? 'توییت برای نمایش فعال شد' : 'توییت از نمایش خارج شد',

      data,

    };

  }

}

