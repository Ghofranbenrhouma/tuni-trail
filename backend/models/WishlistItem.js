// ── WishlistItem Model ─────────────────────────────────────────────────

module.exports = (sequelize, DataTypes) => {
  const WishlistItem = sequelize.define(
    'WishlistItem',
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
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    },
    {
      tableName: 'wishlist_items',
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

  WishlistItem.associate = (models) => {
    WishlistItem.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return WishlistItem;
};
