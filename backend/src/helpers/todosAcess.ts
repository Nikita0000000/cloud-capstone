import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoItem } from '../models/TodoItem'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// dataLayer logic
export class TodosAccess {
    constructor(
        private readonly documentClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly createAtIndex:string = process.env.TODOS_CREATED_AT_INDEX,
        private readonly todoTable: string = process.env.TODOS_TABLE
    ){}

    async createTodo(newTodo:TodoItem): Promise<TodoItem> {
        logger.info("Adding new Todo Item to database ...")
        await this.documentClient.put({
            TableName: this.todoTable,
            Item: newTodo
        }).promise()

        return newTodo
    }

    async getTodosForUser(uId:string): Promise<TodoItem[]>{
        logger.info(`Selecting all Todo Items for user: ${uId}`)
        const query = await this.documentClient.query({
            TableName: this.todoTable,
            IndexName: this.createAtIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {':userId': uId}

        }).promise()
        return query.Items as TodoItem[]
    }

    async updateTodo(uId: string, tId: string, updateTodo:UpdateTodoRequest): Promise<TodoUpdate>{
        const item = await this.documentClient.update({
            TableName: this.todoTable,
            Key: {'userId': uId, 'todoId': tId},
            ExpressionAttributeNames: {
                '#NAMES': 'name',
                '#DDATE': 'dueDate',
                '#DONE': 'done'
            },
            UpdateExpression: 'SET #NAMES = :name, #DDATE = :dueDate, #DONE = :done',
            ExpressionAttributeValues: {
                ':name': updateTodo.name,
                ':dueDate': updateTodo.dueDate,
                ':done': updateTodo.done
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise()

        return item.Attributes as TodoUpdate
    }

    async deleteTodo(uId:string, tId:string) {
        await this.documentClient.delete({
            TableName: this.todoTable,
            Key: {'userId': uId, 'todoId': tId}
        }).promise()
    }
}
