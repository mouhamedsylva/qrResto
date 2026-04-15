import { DataSource } from 'typeorm';
import { Plan } from '../../modules/subscriptions/entities/plan.entity';

export const seedPlans = async (dataSource: DataSource) => {
  const planRepository = dataSource.getRepository(Plan);

  const existingPlans = await planRepository.count();
  if (existingPlans === 0) {
    const plans = [
      {
        name: 'Free',
        description: 'Starter plan for small restaurants',
        price: 0,
        currency: 'EUR',
        interval: 'month',
        features: ['Up to 5 tables', 'Standard Support'],
        isActive: true,
      },
      {
        name: 'Pro',
        description: 'Advanced features for growing businesses',
        price: 29.99,
        currency: 'EUR',
        interval: 'month',
        features: ['Unlimited tables', 'Priority Support', 'Custom Theme'],
        isActive: true,
      },
      {
        name: 'Enterprise',
        description: 'Full control for large chains',
        price: 99.99,
        currency: 'EUR',
        interval: 'month',
        features: ['Multi-restaurant management', 'Dedicated account manager'],
        isActive: true,
      },
    ];

    await planRepository.save(plans);
    console.log('Subscription plans seeded successfully!');
  }
};
