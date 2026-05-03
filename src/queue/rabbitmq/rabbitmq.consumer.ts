import { getRabbitMQChannel } from './rabbitmq.client';
import { AIJobPayload, IQueueConsumer, JobType } from '../queue.types';
import { logger } from '../../shared/utils/logger';

export class RabbitMQConsumer implements IQueueConsumer {
  async subscribe(
    jobType: JobType,
    handler: (payload: AIJobPayload) => Promise<void>
  ): Promise<void> {
    const channel = await getRabbitMQChannel();
    await channel.assertQueue(jobType, { durable: true });
    channel.prefetch(1);

    channel.consume(jobType, async (msg) => {
      if (!msg) return;
      try {
        const payload: AIJobPayload = JSON.parse(msg.content.toString());
        logger.info('RabbitMQ: Processing job', { jobType, questionId: payload.questionId });
        await handler(payload);
        channel.ack(msg);
      } catch (error) {
        logger.error('RabbitMQ: Job failed', { error });
        channel.nack(msg, false, false); // send to dead-letter
      }
    });

    logger.info(`RabbitMQ: Subscribed to ${jobType}`);
  }
}