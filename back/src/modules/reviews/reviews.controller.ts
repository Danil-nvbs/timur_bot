import { Controller, Get, Post, Body, Query, Patch, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  @UseGuards(JwtAuthGuard)
  getByProduct(
    @Param('productId') productId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findByProduct(+productId, parseInt(offset || '0'), parseInt(limit || '10'));
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  latest(
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findLatestAll(parseInt(offset || '0'), parseInt(limit || '10'));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any) {
    return this.reviewsService.create(body);
  }

  @Patch(':id/hide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  hide(@Param('id') id: string) {
    return this.reviewsService.hide(+id);
  }

  @Patch(':id/unhide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  unhide(@Param('id') id: string) {
    return this.reviewsService.unhide(+id);
  }
}


