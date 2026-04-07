// ── Event Model ───────────────────────────────────────────────────────
// Events table: adventure tours and activities for booking

module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    'Event',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Event title is required',
          },
        },
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      duration: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      price: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      price_num: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      difficulty: {
        type: DataTypes.STRING(20),
        defaultValue: 'Facile',
      },
      css_class: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      organizer: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      organizer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 0,
      },
      reviews_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      includes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      excludes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      program: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      lat: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
      },
      lng: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
      },
      map_label: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      max_people: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      min_age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      options: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('published', 'draft', 'suspended'),
        defaultValue: 'published',
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sold: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      revenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    },
    {
      tableName: 'events',
      timestamps: false,
      underscored: false,
    }
  );

  Event.associate = (models) => {
    Event.belongsTo(models.User, {
      foreignKey: 'organizer_id',
      as: 'organizer_details',
      onDelete: 'SET NULL',
    });
    Event.hasMany(models.Reservation, {
      foreignKey: 'event_id',
      as: 'reservations',
      onDelete: 'CASCADE',
    });
    Event.hasMany(models.Review, {
      foreignKey: 'event_id',
      as: 'reviews',
      onDelete: 'CASCADE',
    });
  };

  return Event;
};
