import { NotFoundError } from "#/shared/errors/not-found-error";
import { BlogsRepository } from "./blogs.repository";
import { BlogsSearchParamsDto } from "./dto/request/blog-search-params.dto";
import { CreateBlogRequestBodyDto } from "./dto/request/create-blog-request-body.dto";
import { UpdateBlogRequestBodyDto } from "./dto/request/update-blog-request-body.dto";
import { Blog } from "./entities/blog.entity";

export class BlogsService {
	static async getBlogs(searchParams: BlogsSearchParamsDto): Promise<Blog[]> {
		const blogs = await BlogsRepository.getAll(searchParams);

		return blogs;
	}

	static async getBlog(id: string): Promise<Blog> {
		const blog = await BlogsRepository.getOne({ id: id });

		if (!blog) {
			throw new NotFoundError("Blog not found");
		}

		return blog;
	}

	static async createBlog(
		data: CreateBlogRequestBodyDto,
		authorId: string
	): Promise<Blog> {
		const newBlog = await BlogsRepository.createOne(data, authorId);

		return newBlog;
	}

	static async updateBlog(data: UpdateBlogRequestBodyDto, id: string): Promise<Blog> {
		const updatedBlog = await BlogsRepository.updateOne(data, id);

		if (!updatedBlog) {
			throw new NotFoundError("Blog not found");
		}

		return updatedBlog;
	}

	static async deleteBlog(id: string): Promise<void> {
		const { affected: deleteCount } = await BlogsRepository.deleteOne({ id: id });

		if (!deleteCount) {
			throw new NotFoundError("Blog not found");
		}
	}
}
