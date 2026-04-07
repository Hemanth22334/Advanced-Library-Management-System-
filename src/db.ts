import { Sequelize, DataTypes, Model } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(process.cwd(), 'database.sqlite'),
  logging: false,
});

export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'admin' | 'student';
}

User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'student'), defaultValue: 'student' },
}, { sequelize, modelName: 'user' });

export class Book extends Model {
  public id!: number;
  public title!: string;
  public author!: string;
  public category!: string;
  public quantity!: number;
  public imageUrl!: string | null;
}

Book.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
}, { sequelize, modelName: 'book' });

export class Transaction extends Model {
  public id!: number;
  public userId!: number;
  public bookId!: number;
  public issueDate!: Date;
  public returnDate!: Date | null;
  public dueDate!: Date;
  public status!: 'issued' | 'returned';
}

Transaction.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  bookId: { type: DataTypes.INTEGER, allowNull: false },
  issueDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  returnDate: { type: DataTypes.DATE, allowNull: true },
  dueDate: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('issued', 'returned'), defaultValue: 'issued' },
}, { sequelize, modelName: 'transaction' });

// Relationships
User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

Book.hasMany(Transaction, { foreignKey: 'bookId' });
Transaction.belongsTo(Book, { foreignKey: 'bookId' });

export const initDb = async () => {
  await sequelize.sync();
  console.log('Database synced');
};

export { sequelize };
