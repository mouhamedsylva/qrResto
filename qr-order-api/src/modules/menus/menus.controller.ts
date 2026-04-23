import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MenusService } from './menus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions, PermissionType } from '../auth/decorators/permissions.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateMenuItemDto } from './dto/create-item.dto';
import { UpdateMenuItemDto } from './dto/update-item.dto';
import { ReorderItemsDto } from './dto/reorder-items.dto';
import { StorageService } from '../storage/storage.service';

@ApiTags('Menus & Catégories')
@Controller('menus')
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private readonly storageService: StorageService,
  ) {}


  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une catégorie' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Catégorie créée.' })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.menusService.createCategory(createCategoryDto);
  }

  @Get('categories/:restaurantId')
  @ApiOperation({ summary: "Lister les catégories d'un restaurant" })
  @ApiResponse({
    status: 200,
    description: 'Liste des catégories.',
    schema: {
      example: [
        { id: 'cat-1', name: 'Entrées', restaurantId: 'res-123' },
        { id: 'cat-2', name: 'Plats', restaurantId: 'res-123' },
      ],
    },
  })
  async findCategories(@Param('restaurantId') restaurantId: string) {
    return this.menusService.findCategories(restaurantId);
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour une catégorie' })
  @ApiBody({ type: UpdateCategoryDto })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.menusService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie supprimée.' })
  async removeCategory(@Param('id') id: string) {
    return this.menusService.removeCategory(id);
  }

  @Post('sub-categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une sous-catégorie' })
  async createSubCategory(@Body() dto: any) {
    return this.menusService.createSubCategory(dto);
  }

  @Get('sub-categories/:categoryId')
  @ApiOperation({ summary: 'Lister les sous-catégories d\'une catégorie' })
  async findSubCategories(@Param('categoryId') categoryId: string) {
    return this.menusService.findSubCategories(categoryId);
  }

  @Delete('sub-categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une sous-catégorie' })
  async removeSubCategory(@Param('id') id: string) {
    return this.menusService.removeSubCategory(id);
  }


  @Post('items')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @Permissions(PermissionType.EDIT_MENU)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer un plat ou boisson' })
  @ApiBody({ type: CreateMenuItemDto })
  async createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menusService.createMenuItem(createMenuItemDto);
  }

  @Post('items/upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @Permissions(PermissionType.EDIT_MENU)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: "Uploader l'image d'un article" })
  async uploadMenuItemImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier image fourni');
    }
    const relativePath = await this.storageService.uploadFile(file, 'uploads/menu-items');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return {
      imageUrl: `${baseUrl}${relativePath}`,
      path: relativePath,
    };
  }

  @Put('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @Permissions(PermissionType.EDIT_MENU)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour un plat' })
  @ApiBody({ type: UpdateMenuItemDto })
  async updateMenuItem(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menusService.updateMenuItem(id, updateMenuItemDto);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Permissions(PermissionType.EDIT_MENU)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer un plat' })
  @ApiResponse({ status: 200, description: 'Plat supprimé.' })
  async removeMenuItem(@Param('id') id: string) {
    return this.menusService.removeMenuItem(id);
  }

  @Post('items/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Réorganiser les plats' })
  @ApiBody({ type: ReorderItemsDto })
  async reorderItems(@Body() dto: ReorderItemsDto) {
    return this.menusService.reorderItems(dto);
  }

  @Post('categories/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Réorganiser les catégories' })
  @ApiBody({ type: ReorderItemsDto })
  async reorderCategories(@Body() dto: ReorderItemsDto) {
    return this.menusService.reorderCategories(dto);
  }

  @Post('subcategories/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Réorganiser les sous-catégories' })
  @ApiBody({ type: ReorderItemsDto })
  async reorderSubCategories(@Body() dto: ReorderItemsDto) {
    return this.menusService.reorderSubCategories(dto);
  }

  @Post('items/:id/options')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ajouter une option à un plat' })
  async createItemOption(@Param('id') id: string, @Body() dto: any) {
    return this.menusService.createOption(id, dto);
  }

  @Get('items/:id/options')
  @ApiOperation({ summary: 'Lister les options d\'un plat' })
  async getItemOptions(@Param('id') id: string) {
    return this.menusService.findOptions(id);
  }
}

