import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ShopifyService } from './shopify.service';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('shopify')
export class ShopifyController {
  constructor(
    private readonly shopifyService: ShopifyService,
  ) { }

  @Get('collections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  searchCollections(
    @Req() req,
    @Query('search') search = '',
    @Query('limit') limit = '20',
  ) {
    return this.shopifyService.searchCollections(
      req.user.integrationId,
      search,
      Number(limit),
    );
  }

  @Get('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiOperation({
  summary: 'Search Shopify Products',
})
async searchProducts(
  @Req() req,
  @Query('search') search: string,
  @Query('limit') limit = 10,
) {
  return this.shopifyService.searchProducts(
    req.user.integrationId,
    search,
    Number(limit),
  );
}

  // @Get('products')
  // getProducts(
  //   @Query() query: PaginationDto,
  // ) {
  //   return this.shopifyService.getProducts(
  //     query,
  //   );
  // }

  // @Get('collections/:id/products')
  // getCollectionProducts(
  //   @Param('id') id: string,
  //   @Query() query: PaginationDto,
  // ) {
  //   return this.shopifyService.getCollectionProducts(
  //     id,
  //     query,
  //   );
  // }
}