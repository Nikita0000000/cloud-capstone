import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';

// Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const uid = getUserId(event)
    const todos = await getTodosForUser(uid)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  }
)


handler.use(
  cors({
    credentials: true,
    headers: true,
    origin: '*'
  })
)
