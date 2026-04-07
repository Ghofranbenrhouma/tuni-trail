// ── Reservation Model ──────────────────────────────────────────────────

module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define(
    'Reservation',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ref_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: {
          msg: 'Reference code already exists',
        },
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
      event_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      event_date: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      event_loc: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      event_cls: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      price: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      option_label: {
        type: DataTypes.STRING(50),
        defaultValue: 'Standard',
      },
      ticket_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
          min: {
            args: [1],
            msg: 'Ticket count must be at least 1',
          },
        },
      },
      status: {
        type: DataTypes.ENUM('confirmed', 'pending', 'cancelled'),
        defaultValue: 'confirmed',
      },
      qr_payload: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    },
    {
      tableName: 'reservations',
      timestamps: false,
      underscored: false,
    }
  );

  Reservation.associate = (models) => {
    Reservation.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
    Reservation.belongsTo(models.Event, {
      foreignKey: 'event_id',
      as: 'event',
      onDelete: 'CASCADE',
    });
  };

  return Reservation;
};
