import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1775733051271 implements MigrationInterface {
  name = 'InitialSchema1775733051271';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`categories\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`order\` int NOT NULL DEFAULT '0', \`isActive\` tinyint NOT NULL DEFAULT 1, \`restaurantId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`menu_items\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`price\` decimal(10,2) NOT NULL, \`imageUrl\` varchar(255) NULL, \`isAvailable\` tinyint NOT NULL DEFAULT 1, \`categoryId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`order_items\` (\`id\` varchar(36) NOT NULL, \`quantity\` int NOT NULL, \`priceAtOrder\` decimal(10,2) NOT NULL, \`orderId\` varchar(36) NULL, \`menuItemId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`orders\` (\`id\` varchar(36) NOT NULL, \`totalPrice\` decimal(10,2) NOT NULL, \`status\` enum ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING', \`paymentStatus\` enum ('UNPAID', 'PAID') NOT NULL DEFAULT 'UNPAID', \`stripeSessionId\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`restaurantId\` varchar(36) NULL, \`tableId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tables\` (\`id\` varchar(36) NOT NULL, \`number\` varchar(255) NOT NULL, \`shortCode\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`restaurantId\` varchar(36) NULL, UNIQUE INDEX \`IDX_9ab6ee4537f24d434c5afa6586\` (\`shortCode\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`subscriptions\` (\`id\` varchar(36) NOT NULL, \`stripeSubscriptionId\` varchar(255) NOT NULL, \`stripeCustomerId\` varchar(255) NOT NULL, \`status\` enum ('active', 'canceled', 'past_due', 'incomplete') NOT NULL DEFAULT 'incomplete', \`planId\` varchar(255) NOT NULL, \`currentPeriodEnd\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`restaurantId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`restaurants\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`address\` varchar(255) NULL, \`phoneNumber\` varchar(255) NULL, \`logoUrl\` varchar(255) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`stripeAccountId\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`role\` enum ('SUPER_ADMIN', 'OWNER', 'MANAGER', 'STAFF', 'CUSTOMER') NOT NULL DEFAULT 'STAFF', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`restaurantId\` varchar(36) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_fe8e7d37475de7eb2f8f83a6da0\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_d56e5ccc298e8bf721f75a7eb96\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_d8453d5a71e525d9b406c35aab8\` FOREIGN KEY (\`menuItemId\`) REFERENCES \`menu_items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_2312cd07a04f50ba29d76c9564e\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_2a7fdd7af437285a3ef0fc8b64f\` FOREIGN KEY (\`tableId\`) REFERENCES \`tables\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD CONSTRAINT \`FK_94e0a6541322cecd437cd841701\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`subscriptions\` ADD CONSTRAINT \`FK_8efcb4b7bc1122ed19df1897d22\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_4ca7f2f579cda8a6158c7fc1650\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_4ca7f2f579cda8a6158c7fc1650\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`subscriptions\` DROP FOREIGN KEY \`FK_8efcb4b7bc1122ed19df1897d22\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tables\` DROP FOREIGN KEY \`FK_94e0a6541322cecd437cd841701\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_2a7fdd7af437285a3ef0fc8b64f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_2312cd07a04f50ba29d76c9564e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_d8453d5a71e525d9b406c35aab8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_d56e5ccc298e8bf721f75a7eb96\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_fe8e7d37475de7eb2f8f83a6da0\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`restaurants\``);
    await queryRunner.query(`DROP TABLE \`subscriptions\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_9ab6ee4537f24d434c5afa6586\` ON \`tables\``,
    );
    await queryRunner.query(`DROP TABLE \`tables\``);
    await queryRunner.query(`DROP TABLE \`orders\``);
    await queryRunner.query(`DROP TABLE \`order_items\``);
    await queryRunner.query(`DROP TABLE \`menu_items\``);
    await queryRunner.query(`DROP TABLE \`categories\``);
  }
}
