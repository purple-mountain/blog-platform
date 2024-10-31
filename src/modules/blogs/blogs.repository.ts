import { DeleteResult, Repository } from "typeorm";
import { Blog } from "./entities/blog.entity";
import { CreateBlogRequestBodyDto } from "./dto/request/create-blog-request-body.dto";
import { UpdateBlogRequestBodyDto } from "./dto/request/update-blog-request-body.dto";
import { BlogsSearchParamsDto } from "./dto/request/blog-search-params.dto";
import { db } from "#/database/database";

export class BlogsRepository {
	private static blogsRepository: Repository<Blog> = db
		.getDataSource()
		.getRepository(Blog);

	static async getAll(searchParams: BlogsSearchParamsDto): Promise<Blog[]> {
		const limit = searchParams.limit || 10;
		const page = searchParams.page || 1;
		const { title, tags, content } = searchParams;

		const queryBuilder = this.blogsRepository
			.createQueryBuilder("blog")
			.leftJoinAndSelect("blog.author", "author")
			.select(["blog", "author.id", "author.username", "author.email"])
			.take(limit)
			.skip((page - 1) * limit);

		if (title) {
			queryBuilder.andWhere("blog.title LIKE :title", { title: `%${title}%` });
		}

		if (content) {
			queryBuilder.andWhere("blog.content LIKE :content", { content: `%${content}%` });
		}

		if (tags && tags.length > 0) {
			queryBuilder.andWhere("blog.tags @> :tags", { tags: tags });
		}

		return await queryBuilder.getMany();
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
		const blogToSave = this.blogsRepository.create({ ...data, author: { id: authorId } });

		const createdBlog = await this.blogsRepository.save(blogToSave);

		const fetchedBlog = await this.getOne({ id: createdBlog.id });

		if (!fetchedBlog) {
			throw new Error("Database error");
		}

		return fetchedBlog;
	}

	static async updateOne(
		data: UpdateBlogRequestBodyDto,
		id: string
	): Promise<Blog | null> {
		const blog = await this.getOne({ id });

		if (!blog) {
			return null;
		}

		const updatedBlog = await this.blogsRepository.save({ ...blog, ...data });

		return updatedBlog;
	}

	static async deleteOne({ id }: { id: string }): Promise<DeleteResult> {
		return await this.blogsRepository.delete(id);
	}

	static setRepository(repository: Repository<Blog>) {
		this.blogsRepository = repository;
	}
}
