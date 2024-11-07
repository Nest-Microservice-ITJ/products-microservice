import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductService')
  onModuleInit() {
    this.$connect();
    this.logger.log('Base de datos Conectada');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data:createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const {page, limit} = paginationDto;
    const totalPages = await this.product.count({where:{available:true}});
    const lastPage = Math.ceil(totalPages/limit);

    if(page>lastPage){
      throw new NotFoundException(`The pagina #${page} was not encontrada`);
    }

    
    return {
      data:  await this.product.findMany({
        skip:(page-1)*limit,
        take:limit,
        where:{
          available:true
        }
      }), 
      meta:{
        total:totalPages,
        page:page,
        lastPage:lastPage
        }
      }

//    return this.product.findMany({
//      skip:(page-1)*limit,
//      take:limit
//    });
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({where:{id, available : true}})
    if(!product){
      throw new NotFoundException(`Product with id #${id} not found`);
    }
    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const {id:__,...data}=updateProductDto;
    await this.findOne(id);
    return this.product.update({
      
      where:{id},
      data:data,
    })
  }

  async remove(id: number) {
    await this.findOne(id);
     
    /*return this.product.delete({
      where:{id}
    });
    */

    const product = await this.product.update({
      where:{id},
      data:{
        available:false
      }
    })


  }
}
