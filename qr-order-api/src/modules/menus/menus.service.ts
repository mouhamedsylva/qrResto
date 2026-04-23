import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { MenuItemOption } from './entities/menu-item-option.entity';
import { ReorderItemsDto } from './dto/reorder-items.dto';
import { CreateMenuItemDto } from './dto/create-item.dto';
import { UpdateMenuItemDto } from './dto/update-item.dto';

@Injectable()
export class MenusService {
  private menuItemOrderColumn: 'order' | 'orders' | null | undefined;

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(MenuItemOption)
    private optionRepository: Repository<MenuItemOption>,
    @InjectRepository(SubCategory)
    private subCategoryRepository: Repository<SubCategory>,
    private dataSource: DataSource,
  ) {}


  // Category methods
  async createCategory(createCategoryDto: any) {
    const { restaurantId, ...data } = createCategoryDto;
    const existing = await this.categoryRepository.findOne({
      where: { name: data.name, restaurant: { id: restaurantId } },
    });
    if (existing) {
      throw new BadRequestException('Une catégorie avec ce nom existe déjà');
    }

    const category = this.categoryRepository.create({
      ...data,
      restaurant: { id: restaurantId },
    });
    return this.categoryRepository.save(category);
  }

  async findCategories(restaurantId: string) {
    return this.categoryRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: ['items', 'subCategories'],
      order: { 
        order: 'ASC',
        subCategories: { order: 'ASC' },
        items: { displayOrder: 'ASC' }
      },
    });
  }


  async updateCategory(id: string, updateCategoryDto: any) {
    if (updateCategoryDto.name) {
      const category = await this.categoryRepository.findOne({ where: { id }, relations: ['restaurant'] });
      if (category) {
        const existing = await this.categoryRepository.findOne({
          where: { name: updateCategoryDto.name, restaurant: { id: category.restaurant.id } },
        });
        if (existing && existing.id !== id) {
          throw new BadRequestException('Une catégorie avec ce nom existe déjà');
        }
      }
    }
    await this.categoryRepository.update(id, updateCategoryDto);
    return this.categoryRepository.findOne({ where: { id } });
  }

  async removeCategory(id: string) {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Categorie introuvable');
    }
    return { success: true };
  }

  // SubCategory methods
  async createSubCategory(dto: any) {
    const { categoryId, ...data } = dto;
    const subCategory = this.subCategoryRepository.create({
      ...data,
      category: { id: categoryId },
    });
    return this.subCategoryRepository.save(subCategory);
  }

  async findSubCategories(categoryId: string) {
    return this.subCategoryRepository.find({
      where: { category: { id: categoryId } },
      order: { order: 'ASC' },
    });
  }

  async removeSubCategory(id: string) {
    const result = await this.subCategoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Sous-categorie introuvable');
    }
    return { success: true };
  }

  // MenuItem methods
  async createMenuItem(createMenuItemDto: CreateMenuItemDto) {
    const { categoryId, ...data } = createMenuItemDto;
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Categorie introuvable pour cet article');
    }

    const normalizedPrice = Number(data.price);
    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      throw new BadRequestException('Le prix doit etre un nombre positif');
    }

    const item = this.menuItemRepository.create({
      ...data,
      price: normalizedPrice,
      category: { id: categoryId },
      subCategory: data.subCategoryId ? { id: data.subCategoryId } : undefined,
    });
    return this.menuItemRepository.save(item);
  }

  async updateMenuItem(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    const { categoryId, subCategoryId, ...data } = updateMenuItemDto;
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Article introuvable');
    }

    Object.assign(item, data);
    
    if (categoryId) {
      item.category = { id: categoryId } as any;
    }
    
    if (subCategoryId !== undefined) {
      item.subCategory = subCategoryId ? { id: subCategoryId } as any : null;
    }

    return this.menuItemRepository.save(item);
  }

  async removeMenuItem(id: string) {
    const result = await this.menuItemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Article introuvable');
    }
    return { success: true };
  }

  async reorderItems(dto: ReorderItemsDto) {
    await Promise.all(
      dto.orders.map((item) =>
        this.menuItemRepository.update(item.id, { displayOrder: item.order }),
      ),
    );

    return { message: 'Items reordered successfully' };
  }

  async reorderCategories(dto: ReorderItemsDto) {
    await Promise.all(
      dto.orders.map((item) =>
        this.categoryRepository.update(item.id, { order: item.order }),
      ),
    );

    return { message: 'Categories reordered successfully' };
  }

  async reorderSubCategories(dto: ReorderItemsDto) {
    await Promise.all(
      dto.orders.map((item) =>
        this.subCategoryRepository.update(item.id, { order: item.order }),
      ),
    );

    return { message: 'Subcategories reordered successfully' };
  }

  async createOption(menuItemId: string, dto: any) {
    const option = this.optionRepository.create({
      ...dto,
      menuItem: { id: menuItemId } as any,
    });
    return this.optionRepository.save(option);
  }

  async findOptions(menuItemId: string) {
    return this.optionRepository.find({
      where: { menuItem: { id: menuItemId } },
    });
  }
}

