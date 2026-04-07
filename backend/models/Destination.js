// ── Destination Model ──────────────────────────────────────────────────

module.exports = (sequelize, DataTypes) => {
  const Destination = sequelize.define(
    'Destination',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Destination name is required',
          },
        },
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      altitude: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      difficulty: {
        type: DataTypes.STRING(20),
        defaultValue: 'Facile',
      },
      diff_class: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      duration: {
        type: DataTypes.STRING(20),
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
      lat: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
      },
      lng: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      highlights: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      season: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      emoji: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      gradient: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'destinations',
      timestamps: false,
      underscored: false,
    }
  );

  return Destination;
};
