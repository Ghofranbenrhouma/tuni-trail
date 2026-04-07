// ── Review Model ───────────────────────────────────────────────────────

module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    'Review',
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
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: [1],
            msg: 'Rating must be between 1 and 5',
          },
          max: {
            args: [5],
            msg: 'Rating must be between 1 and 5',
          },
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('published', 'pending', 'reported', 'deleted'),
        defaultValue: 'published',
      },
      report_reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    },
    {
      tableName: 'reviews',
      timestamps: false,
      underscored: false,
    }
  );

  Review.associate = (models) => {
    Review.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
    Review.belongsTo(models.Event, {
      foreignKey: 'event_id',
      as: 'event',
      onDelete: 'CASCADE',
    });
  };

  return Review;
};
