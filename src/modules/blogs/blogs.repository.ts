import { AppDataSource } from "#/database/database";
import { DeleteResult, Repository } from "typeorm";
import { Blog } from "./entities/blog.entity";
import { CreateBlogRequestBodyDto } from "./dto/request/create-blog-request-body.dto";
import { UpdateBlogRequestBodyDto } from "./dto/request/update-blog-request-body.dto";
import { BlogsSearchParamsDto } from "./dto/request/blog-search-params.dto";
import { UsersRepository } from "../users/users.repository";

export class BlogsRepository {
	private static blogsRepository: Repository<Blog> = AppDataSource.getRepository(Blog);

	static async getAll(searchParams: BlogsSearchParamsDto): Promise<Blog[]> {
		const limit = searchParams.limit || 10;
		const page = searchParams.page || 1;

		return await this.blogsRepository.find({
			take: limit,
			skip: (page - 1) * limit,
			relations: ["author"],
			select: {
				author: {
					id: true,
					username: true,
					email: true,
				},
			},
		});
	}

	static async getOne({ id }: { id: string }): Promise<Blog | null> {
		return await this.blogsRepository.findOne({
			where: { id },
			relations: ["author"],
			select: {
				author: {
					id: true,
					username: true,
					email: true,
				},
			},
		});
	}

	static async createOne(
		data: CreateBlogRequestBodyDto,
		authorId: string
	): Promise<Blog> {
		const newBlog = this.blogsRepository.create({ ...data, author: { id: authorId } });

		await this.blogsRepository.save(newBlog);

		const author = await UsersRepository.getOneById({ id: newBlog.author.id });

		if (!author) {
			throw new Error("Database error");
		}

		return {
			...newBlog,
			author: { id: author.id, email: author.email, username: author.username },
		};
	}

	static async updateOne(
		data: UpdateBlogRequestBodyDto,
		id: string
	): Promise<Blog | null> {
		const blog = await this.blogsRepository.findOne({
			where: { id },
			relations: ["author"],
			select: {
				author: {
					id: true,
					username: true,
					email: true,
				},
			},
		});

		if (!blog) {
			return null;
		}

		const updatedBlog = await this.blogsRepository.save({ ...blog, ...data });

		return updatedBlog;
	}

	static async deleteOne({ id }: { id: string }): Promise<DeleteResult> {
		return await this.blogsRepository.delete(id);
	}
}
