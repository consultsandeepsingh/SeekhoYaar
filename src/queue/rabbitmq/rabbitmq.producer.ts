import { getRabbitMQChannel } from './rabbitmq.client';
import { AIJobPayload, IQueueProducer, JobType } from '../queue.types';
import { logger } from '../../shared/utils/logger';

export class RabbitMQProducer implements IQueueProducer {
  async publish(jobType: JobType, payload: AIJobPayload): Promise<void> {
    const channel = await getRabbitMQChannel();
    await channel.assertQueue(jobType, { durable: true });

    channel.sendToQueue(
      jobType,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );

    logger.info('RabbitMQ: Job published', { jobType, questionId: payload.questionId });
  }
}