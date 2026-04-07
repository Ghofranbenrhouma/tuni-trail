// ── CartItem Model ─────────────────────────────────────────────────────

module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define(
    'CartItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      product_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
          min: {
            args: [1],
            msg: 'Quantity must be at least 1',
          },
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    },
    {
      tableName: 'cart_items',
      timestamps: false,
      underscored: false,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'product_id'],
        },
      ],
    }
  );

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return CartItem;
};
