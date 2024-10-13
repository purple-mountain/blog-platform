import { NotFoundError } from "#/shared/errors/not-found-error";
import { CommentsRepository } from "../comments/comments.repository";
import { CreateCommentRequestBodyDto } from "../comments/dto/request/create-comment-request-body.dto";
import { Comment } from "../comments/entities/comment.entity";
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

	static async getBlog(blogId: string): Promise<Blog> {
		const blog = await BlogsRepository.getOne({ id: blogId });

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

	static async updateBlog(data: UpdateBlogRequestBodyDto, blogId: string): Promise<Blog> {
		const updatedBlog = await BlogsRepository.updateOne(data, blogId);

		if (!updatedBlog) {
			throw new NotFoundError("Blog not found");
		}

		return updatedBlog;
	}

	static async deleteBlog(blogId: string): Promise<void> {
		const { affected: deleteCount } = await BlogsRepository.deleteOne({ id: blogId });

		if (!deleteCount) {
			throw new NotFoundError("Blog not found");
		}
	}

	static async getBlogComments(searchParams: BlogsSearchParamsDto, blogId: string) {
		const comments = await CommentsRepository.getAllByBlogId(searchParams, blogId);

		if (!comments) {
			throw new NotFoundError("Blog not found");
		}

		return comments;
	}

	static async createBlogComment(
		data: CreateCommentRequestBodyDto,
		authorId: string,
		blogId: string
	): Promise<Comment> {
		const blogExists = await BlogsRepository.getOne({ id: blogId });

		if (!blogExists) {
			throw new NotFoundError("Blog not found");
		}

		const newBlogComment = await CommentsRepository.createOne(data, authorId, blogId);

		return newBlogComment;
	}
}
