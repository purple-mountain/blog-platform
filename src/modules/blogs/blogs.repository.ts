import { AppDataSource } from "#/database/database";
import { DeleteResult, Repository } from "typeorm";
import { Blog } from "./entities/blog.entity";
import { CreateBlogRequestBodyDto } from "./dto/request/create-blog-request-body.dto";
import { UpdateBlogRequestBodyDto } from "./dto/request/update-blog-request-body.dto";
import { BlogsSearchParamsDto } from "./dto/request/blog-search-params.dto";

export class BlogsRepository {
	private static repository: Repository<Blog> = AppDataSource.getRepository(Blog);

	static async getAll(searchParams: BlogsSearchParamsDto): Promise<Blog[]> {
		const limit = searchParams.limit || 10;
		const page = searchParams.page || 1;

		return await this.repository.find({
			take: limit,
			skip: (page - 1) * limit,
		});
	}

	static async getOne(id: string): Promise<Blog | null> {
		return await this.repository.findOne({ where: { id } });
	}

	static async createOne(
		data: CreateBlogRequestBodyDto,
		authorId: string
	): Promise<Blog> {
		const newBlog = this.repository.create({ ...data, author: { id: authorId } });

		return await this.repository.save(newBlog);
	}

	static async updateOne(
		data: UpdateBlogRequestBodyDto,
		id: string
	): Promise<Blog | null> {
		const blog = await this.repository.findOne({ where: { id } });

		if (!blog) {
			return null;
		}

		const updatedBlog = await this.repository.save({ ...blog, ...data });

		return updatedBlog;
	}

	static async deleteOne(id: string): Promise<DeleteResult> {
		return await this.repository.delete(id);
	}
}
