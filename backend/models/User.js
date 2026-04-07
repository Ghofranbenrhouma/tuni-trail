// ── User Model ─────────────────────────────────────────────────────────
// Users table: system users with roles and profiles

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
          msg: 'Email already in use',
        },
        validate: {
          isEmail: {
            msg: 'Invalid email format',
          },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: {
            args: [6, 255],
            msg: 'Password must be at least 6 characters',
          },
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Aventurier',
        validate: {
          len: {
            args: [1, 100],
            msg: 'Name must be between 1 and 100 characters',
          },
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('user', 'org', 'admin', 'pending_org'),
        allowNull: false,
        defaultValue: 'user',
      },
      activities: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    },
    {
      tableName: 'users',
      timestamps: false, // We manage createdAt manually
      underscored: false,
    }
  );

  // ── Associations ────────────────────────────────────────────────────
  User.associate = (models) => {
    User.hasMany(models.Event, {
      foreignKey: 'organizer_id',
      as: 'organizedEvents',
      onDelete: 'SET NULL',
    });
    User.hasMany(models.Reservation, {
      foreignKey: 'user_id',
      as: 'reservations',
      onDelete: 'CASCADE',
    });
    User.hasMany(models.Order, {
      foreignKey: 'user_id',
      as: 'orders',
      onDelete: 'CASCADE',
    });
    User.hasMany(models.CartItem, {
      foreignKey: 'user_id',
      as: 'cartItems',
      onDelete: 'CASCADE',
    });
    User.hasMany(models.WishlistItem, {
      foreignKey: 'user_id',
      as: 'wishlistItems',
      onDelete: 'CASCADE',
    });
    User.hasMany(models.Review, {
      foreignKey: 'user_id',
      as: 'reviews',
      onDelete: 'CASCADE',
    });
    User.hasMany(models.OrgRequest, {
      foreignKey: 'user_id',
      as: 'orgRequests',
      onDelete: 'CASCADE',
    });
    User.hasMany(models.CommunityPost, {
      foreignKey: 'user_id',
      as: 'posts',
      onDelete: 'CASCADE',
    });
  };

  // ── Hooks: Hash password before saving ──────────────────────────────
  User.beforeCreate(async (user) => {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  // ── Instance Methods ────────────────────────────────────────────────
  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password; // Never return password in API response
    return values;
  };

  return User;
};
