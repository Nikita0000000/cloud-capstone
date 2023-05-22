import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Form,
  TextArea,
  Loader
} from 'semantic-ui-react'

import { createBlog, deleteBlog, getBlogs, patchBlog } from '../api/blogs-api'
import Auth from '../auth/Auth'
import { Blog } from '../types/Blog'

interface BlogsProps {
  auth: Auth
  history: History
}

interface BlogsState {
  blogs: Blog[]
  newBlogName: string
  blogSummary: string
  loadingBlogs: boolean
}

export class Blogs extends React.PureComponent<BlogsProps, BlogsState> {
  state: BlogsState = {
    blogs: [],
    newBlogName: '',
    blogSummary: '',
    loadingBlogs: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBlogName: event.target.value })
  }
  handleSummaryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ blogSummary: event.target.value })
  }

  handleBroken = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.visibility = "hidden";
  }

  onEditButtonClick = (blogId: string) => {
    this.props.history.push(`/blogs/${blogId}/edit`)
  }

  onBlogCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newBlog = await createBlog(this.props.auth.getIdToken(), {
        name: this.state.newBlogName,
        summary: this.state.blogSummary,
        dueDate
      })
      this.setState({
        blogs: [...this.state.blogs, newBlog],
        newBlogName: '',
        blogSummary: ''
      })
    } catch {
      alert('Blog creation failed')
    }
  }

  onBlogDelete = async (blogId: string) => {
    try {
      await deleteBlog(this.props.auth.getIdToken(), blogId)
      this.setState({
        blogs: this.state.blogs.filter(blog => blog.blogId !== blogId)
      })
    } catch {
      alert('Blog deletion failed')
    }
  }

  onBlogCheck = async (pos: number) => {
    try {
      const blog = this.state.blogs[pos]
      await patchBlog(this.props.auth.getIdToken(), blog.blogId, {
        name: blog.name,
        summary: blog.summary,
        dueDate: blog.dueDate,
        done: !blog.done
      })
      this.setState({
        blogs: update(this.state.blogs, {
          [pos]: { done: { $set: !blog.done } }
        })
      })
    } catch {
      alert('Blog deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const blogs = await getBlogs(this.props.auth.getIdToken())
      this.setState({
        blogs,
        loadingBlogs: false
      })
    } catch (e) {
      alert(`Failed to fetch blogs: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">BLOGs</Header>

        {this.renderCreateBlogInput()}

        {this.renderBlogs()}
      </div>
    )
  }

  renderCreateBlogInput() {
    return (
      <Grid.Row>
        <Header as='h3'>Create New Blog:</Header>
        <Grid.Column width={16}>
          <Form onSubmit={ this.onBlogCreate}>
              <Input
                label='Blog Title'
                fluid
                placeholder="Set the blog title"
                onChange={this.handleNameChange}
              />
              <TextArea
                label='Summary'
                fluid
                placeholder="Add summary of blog"
                onChange={this.handleSummaryChange}
              />
              <Button 
                type='submit'
                >New Blog</Button>
          </Form>
          
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderBlogs() {
    if (this.state.loadingBlogs) {
      return this.renderLoading()
    }

    return this.renderBlogsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading BLOGs
        </Loader>
      </Grid.Row>
    )
  }

  renderBlogsList() {
    return (
      <Grid padded>
        <Header as='h3'>Blog List</Header>
        {this.state.blogs.map((blog, pos) => {
          return (
            <Grid.Row key={blog.blogId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onBlogCheck(pos)}
                  checked={blog.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                <p>{blog.name}</p>
                <p>{blog.summary}</p>
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {blog.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(blog.blogId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBlogDelete(blog.blogId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {blog.attachmentUrl && (
                <Image src={blog.attachmentUrl} size="small" wrapped onError={this.handleBroken} />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
