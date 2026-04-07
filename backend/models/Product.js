// ── Product Model ──────────────────────────────────────────────────────

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Product name is required',
          },
        },
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      price: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      price_num: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      badge: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      badge_cls: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 0,
      },
      reviews_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      in_stock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      css_class: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: 'products',
      timestamps: false,
      underscored: false,
    }
  );

  return Product;
};
