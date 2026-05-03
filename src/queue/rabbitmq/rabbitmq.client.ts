import amqplib, { Connection, Channel } from 'amqplib';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';

let connection: Connection | null = null;
let channel: Channel | null = null;

export const getRabbitMQChannel = async (): Promise<Channel> => {
  if (!channel) {
    connection = await amqplib.connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();
    logger.info('✅ RabbitMQ connected');

    connection.on('error', (err) => logger.error('RabbitMQ connection error', { err }));
    connection.on('close', () => logger.warn('RabbitMQ connection closed'));
  }
  return channel;
};