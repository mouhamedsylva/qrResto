import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyUserName1775733485807 implements MigrationInterface {
  name = 'UnifyUserName1775733485807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`firstName\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`lastName\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_fe8e7d37475de7eb2f8f83a6da0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`restaurantId\` \`restaurantId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_d56e5ccc298e8bf721f75a7eb96\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` CHANGE \`description\` \`description\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` CHANGE \`imageUrl\` \`imageUrl\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` CHANGE \`categoryId\` \`categoryId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_d8453d5a71e525d9b406c35aab8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` CHANGE \`orderId\` \`orderId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` CHANGE \`menuItemId\` \`menuItemId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_2312cd07a04f50ba29d76c9564e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_2a7fdd7af437285a3ef0fc8b64f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`stripeSessionId\` \`stripeSessionId\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`restaurantId\` \`restaurantId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`tableId\` \`tableId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tables\` DROP FOREIGN KEY \`FK_94e0a6541322cecd437cd841701\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tables\` CHANGE \`restaurantId\` \`restaurantId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`subscriptions\` DROP FOREIGN KEY \`FK_8efcb4b7bc1122ed19df1897d22\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`subscriptions\` CHANGE \`currentPeriodEnd\` \`currentPeriodEnd\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`subscriptions\` CHANGE \`restaurantId\` \`restaurantId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`restaurants\` CHANGE \`address\` \`address\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`restaurants\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`restaurants\` CHANGE \`logoUrl\` \`logoUrl\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`restaurants\` CHANGE \`stripeAccountId\` \`stripeAccountId\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_4ca7f2f579cda8a6158c7fc1650\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`restaurantId\` \`restaurantId\` varchar(36) NULL`,
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
      `ALTER TABLE \`users\` CHANGE \`restaurantId\` \`restaurantId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_4ca7f2f579cda8a6158c7fc1650\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`restaurants\` CHANGE \`stripeAccountId\` \`stripeAccountId\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`restaurants\` CHANGE \`logoUrl\` \`logoUrl\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`restaurants\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`restaurants\` CHANGE \`address\` \`address\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`subscriptions\` CHANGE \`restaurantId\` \`restaurantId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`subscriptions\` CHANGE \`currentPeriodEnd\` \`currentPeriodEnd\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`subscriptions\` ADD CONSTRAINT \`FK_8efcb4b7bc1122ed19df1897d22\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tables\` CHANGE \`restaurantId\` \`restaurantId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD CONSTRAINT \`FK_94e0a6541322cecd437cd841701\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`tableId\` \`tableId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`restaurantId\` \`restaurantId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`stripeSessionId\` \`stripeSessionId\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_2a7fdd7af437285a3ef0fc8b64f\` FOREIGN KEY (\`tableId\`) REFERENCES \`tables\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_2312cd07a04f50ba29d76c9564e\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` CHANGE \`menuItemId\` \`menuItemId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` CHANGE \`orderId\` \`orderId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_d8453d5a71e525d9b406c35aab8\` FOREIGN KEY (\`menuItemId\`) REFERENCES \`menu_items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` CHANGE \`categoryId\` \`categoryId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` CHANGE \`imageUrl\` \`imageUrl\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_d56e5ccc298e8bf721f75a7eb96\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`restaurantId\` \`restaurantId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_fe8e7d37475de7eb2f8f83a6da0\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`lastName\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`firstName\` varchar(255) NOT NULL`,
    );
  }
}
